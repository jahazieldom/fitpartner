from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.utils import timezone
from django.conf import settings
from django.db.models import Sum, DecimalField
from django.shortcuts import render, HttpResponse
import datetime
import requests
import decimal
from django.db.models.query import QuerySet
from django.db.models import F
from django.db import connection

ELEMENTOS_PAGINA = (
    (25, "25"),
    (50, "50"),
    (100, "100"),
    (1000, "1000"),
)

def get_tenant():
    return connection.tenant

def to_datetime(date, max=False, use_localtime=True, min=False):
    """
    Convierte un datetime naive en aware.
    """
    if max and min:
        raise ValueError(
            "Los argumentos max y min deben ser mutuamente excluyentes"
        )

    if hasattr(date, "tzinfo") and date.tzinfo and not min and not max:
        return date

    if not isinstance(date, (datetime.date, datetime.datetime)):
        return date

    dt = datetime.datetime

    t = dt.min.time()

    # si date es datetime conservamos la hora que trae
    if not min and isinstance(date, (datetime.datetime,)):
        t = date.time()

    if max:
        t = dt.max.time()

    naive_dt = dt.combine(date, t)

    if settings.USE_TZ:
        # Usa timezone.get_current_timezone() para obtener la zona activa
        tz = timezone.get_current_timezone() if use_localtime else datetime.timezone.utc
        aware_dt = timezone.make_aware(naive_dt, tz)
        return aware_dt

    return naive_dt


def date_to_str(date, to_date=False, short_year=False):

    if not date:
        return ""

    if short_year:
        date_format = "%d/%m/%y"
    else:
        date_format = "%d/%m/%Y"

    datetime_format = "%s %s" % (date_format, "%H:%M:%S")

    if isinstance(date, (datetime.datetime)):
        local_date = timezone.localtime(date)
        if to_date:
            return local_date.strftime(date_format)

        return local_date.strftime(datetime_format)

    return date.strftime(date_format)


def localtime(time=None):
    """
    Retorna un datetime con el time zone activo.
    """
    if not time:
        time = timezone.now()

    elif not isinstance(time, (datetime.datetime)):
        return time

    if not settings.USE_TZ:
        return time

    return timezone.localtime(time)


def list_view(request, objects, template, context={}, *, with_count=True):
    """
    Recibe un request, un queryset, y un template, opcionalmente puede recibir
    un diccionario para renderear el template.

    Regresa un resonse ya rendereado con la página específica, funciona
    para generar los listados del sistema en general.

    Por defecto asigna un tamaño del primer valor que esté en la constante
    ELEMENTOS_PAGINA
    """
    try:
        iter(objects)
    except TypeError as te:
        RuntimeError(
            "El atributo objects debe ser iterable, no {}".format(objects)
        )

    default_page_size = ELEMENTOS_PAGINA[0][0]

    try:
        page_size = int(request.GET.get("page_size", default_page_size))
    except ValueError:
        page_size = default_page_size

    try:
        page = int(request.GET.get("page", 1))
    except ValueError:
        page = 1

    if not context.get("objects") is None:
        raise RuntimeError(
            "El diccionario de contexto no debe incluir la "
            "llave objects, ya que será redefinida por el paginador"
        )

    sort_by = request.GET.get("sort_by")
    if isinstance(objects, QuerySet) and sort_by:
        desc = "-" in sort_by
        field_name = sort_by.replace("-", "")

        if hasattr(objects.model, field_name):
            if desc:
                objects = objects.order_by(F(field_name).desc(nulls_last=True))
            else:
                objects = objects.order_by(F(field_name).asc(nulls_last=True))

    paginator = Paginator(objects, page_size)

    try:
        listado = paginator.page(page)
    except (EmptyPage, InvalidPage):
        listado = paginator.page(paginator.num_pages)

    if page < 5:
        _page = page
        page_ = 10 - page
    else:
        _page = 5
        page_ = 5

        if (page + 5) > listado.paginator.num_pages:
            page_ = listado.paginator.num_pages - page
            _page = 10 - page_

    pages_ant = page - _page if (page - _page) > 0 else 0
    page_range = list(listado.paginator.page_range)[pages_ant : page + page_]

    context["page_range"] = page_range
    context["list"] = listado
    context["objects"] = listado.object_list

    if with_count:
        context["objects_count"] = listado.paginator.count

    return render_to(request, template, context)


def random_str(length):
    import random
    import string

    letters = string.ascii_lowercase
    result_str = "".join(random.choice(letters) for i in range(length))
    return result_str


def to_precision_decimales(valor_decimal, precision=2):
    from decimal import Decimal, ROUND_HALF_UP

    if not valor_decimal:
        return Decimal("0.00")
    return Decimal("%s" % valor_decimal).quantize(
        Decimal("0.%0*d" % (precision, 1)), ROUND_HALF_UP
    )


def get_email_context(request=None):
    from config.models import GeneralConfiguration

    general_config = GeneralConfiguration.objects.tenant_all().first()
    if request:
        general_config = request.general_config

    return {
        "general_config": general_config,
        "settings": settings,
    }


def send_email(to, subject, html=None, message=None, from_email=None):
    from django.core.mail import send_mail as _send_email
    from django.utils.html import strip_tags

    if not message and html:
        message = strip_tags(html)

    if not from_email:
        from_email = f"{settings.PROJECT_NAME} <{settings.FROM_EMAIL}>"

    message_id = _send_email(
        subject,
        message,
        from_email,
        to,
        html_message=html,
        fail_silently=True,
    )

    return message_id


def render_pdf(
    template_src,
    context_dict,
    to_file=None,
    name="documento",
    landscape=False,
    footer=None,
    empresa=None,
    header=False,
    paper_size="Letter",
    paper_width=None,
    paper_height=None,
    request=None,
    margins=True,
    text_html=None,
    nueva_version=False,
    header_spacing=None,
    header_left=None,
    header_right=None,
    footer_right=None,
    footer_left=None,
    binary_file=False,
    footer_spacing=None,
    **kwargs,
):
    """
    Esta función convierte html a pdf, se planea sustituya a report_editor por
    completo en los próximos años.
    """
    import sys
    import time
    from django.template import Context, Template
    from django.template.loader import get_template

    if not name.endswith(".pdf"):
        name = name + ".pdf"

    if getattr(settings, "PDF_CONTEXT_MAX_SIZE", None):
        if sys.getsizeof(context_dict) > settings.PDF_CONTEXT_MAX_SIZE:
            errmsg = "El archivo es muy grande para generarse el PDF."
            if to_file:
                raise ValueError(errmsg)
            return error_view(request, errmsg)

    c = 0

    context_dict["STATIC_URL"] = settings.STATIC_URL
    context_dict["MEDIA_URL"] = settings.MEDIA_URL
    context_dict["BASE_URL"] = settings.BASE_URL

    debug = kwargs.get("html")
    if debug is None and request:
        debug = request.GET.get("debug")

    valid_kwargs = [
        "footer-left",
        "footer-center",
        "footer-right",
        "header-left",
        "header-center",
        "header-right",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "header-font-name",
        "header-font-size",
        "footer-font-name",
        "footer-font-size",
        "header-spacing",
        "footer-spacing",
        "page-offset",
        "footer-line",
    ]

    bool_kwargs = ["footer-line"]
    context_dict["settings"] = settings
    template = get_template(template_src)
    input_html = template.render(context_dict)
    opts = {}

    if footer:
        opts["footer-html"] = footer

    if footer_left:
        opts["footer-left"] = footer_left

    if footer_right:
        opts["footer-right"] = footer_right

    if header:
        opts["header-html"] = header

    if header_left:
        opts["header-left"] = header_left

    if header_right:
        opts["header-right"] = header_right

    if header_spacing:
        opts["header-spacing"] = header_spacing

    if footer_spacing:
        opts["footer-spacing"] = footer_spacing

    if "margin_top" in kwargs:
        opts["margin-top"] = kwargs.get("margin_top")

    if "margin_right" in kwargs:
        opts["margin-right"] = kwargs.get("margin_right")

    if "margin_bottom" in kwargs:
        opts["margin-bottom"] = kwargs.get("margin_bottom")

    if "margin_left" in kwargs:
        opts["margin-left"] = kwargs.get("margin_left")

    if "disable_smart_shrinking" in kwargs:
        opts["disable-smart-shrinking"] = kwargs.get("disable_smart_shrinking")

    if landscape:
        opts["orieintation"] = "Landscape"

    if not margins:
        opts["margins"] = margins

    if paper_size:
        opts["paper-size"] = paper_size

    if paper_width:
        opts["page-width"] = paper_width

    if paper_height:
        opts["page-height"] = paper_height

    if debug == "html":
        return HttpResponse(input_html)

    url = settings.PDFGEN_URL + "create/"
    try:
        api_headers = {
            "Custom-Template": template_src,
        }
        api_json = {"filename": name, "html": input_html, "options": opts}
        api_call = requests.post(url, json=api_json, headers=api_headers)
    except requests.exceptions.ConnectionError as e:
        raise e

    if not api_call.ok:
        error = "PDF Error {}: {}".format(api_call.url, api_call.content)
        raise Exception(error)

    if to_file:
        with open(to_file, "wb") as f:
            f.write(api_call.content)
        return None

    elif binary_file:
        # Lo regresa como un diccionario para ser enviado via email
        return {
            "name": name,
            "data": api_call.content,
            "content_type": "application/pdf",
        }
    else:
        r = HttpResponse(api_call.content)
        r["Content-Type"] = api_call.headers.get("Content-Type")
        r["Content-Disposition"] = api_call.headers.get("Content-Disposition")
        return r


def to_int(s):
    try:
        return int(s)
    except:
        return 0


def to_decimal(s):
    import math
    from decimal import Decimal, InvalidOperation

    try:
        s = str(s)
        s = s.replace("$", "")
        d = Decimal("".join(s.split(",")))
        return d if not math.isnan(float(d)) else Decimal("0")
    except (InvalidOperation, ValueError, TypeError):
        return Decimal("0")


def aggregate_sum(qs, field, cast_to_decimal=True):
    from django.db.models import F

    if type(field) == str:
        field = F(field)

    if qs is None:
        return to_decimal("0")

    monto = qs.aggregate(suma=Sum(field, output_field=DecimalField()))

    if cast_to_decimal:
        return to_decimal(monto["suma"])

    return to_int(monto["suma"])


def add_month(year, month):
    month = int(month)
    year = int(year)
    month += 1
    if month == 13:
        month = 1
        year += 1
    return [year, month]


def subtract_month(year, month, n=1):
    month = int(month)
    year = int(year)

    for i in range(0, n):
        month -= 1
        if month == 0:
            month = 12
            year -= 1

    return [year, month]


def log(msg, level="info", use_pprint=True):
    from pprint import pprint

    if use_pprint:
        pprint(msg)
    else:
        print(msg)


def send_to_sentry(e, data={}, level="error", tags={}, user=None):
    import sentry_sdk

    if settings.DEBUG:
        return print(e, data)

    with sentry_sdk.push_scope() as scope:
        if user:
            scope.user = {"email": user.email, "id": user.id}

        if tags:
            for k, v in tags.items():
                scope.set_tag(k, v)

        if data:
            for k, v in data.items():
                scope.set_extra(k, v)

    if isinstance(e, Exception):
        try:
            return sentry_sdk.capture_exception(e, level=level)
        except Exception as e:
            pass
    else:
        return sentry_sdk.capture_message(e, level=level)


def google_recaptcha_validate(g_recaptcha_response):
    secret = getattr(settings, "GOOGLE_RECAPTCHA_SECRET", None)

    if not secret:
        return False

    url = "https://www.google.com/recaptcha/api/siteverify"
    data = {
        "secret": secret,
        "response": g_recaptcha_response,
    }
    try:
        res = requests.post(url, data=data)
        return res.json().get("success")
    except Exception as e:
        pass

    return False


def get_user_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def get_location(ip_address, timeout=8):
    try:
        response = requests.get(
            f"https://ipapi.co/{ip_address}/json/", timeout=timeout
        ).json()
        return {"status": "success", "location": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}
        pass

def dict_to_json(data_dict):
    import json
    
    class CustomJSONEncoder(json.JSONEncoder):
        def default(self, obj):
            from datetime import datetime as datetime_obj, date as date_obj
            import decimal
            
            if isinstance(obj, datetime_obj) or isinstance(obj, date_obj):
                return obj.isoformat()

            if isinstance(obj, decimal.Decimal):
                return str(obj)
            
            return json.JSONEncoder.default(self, obj)
        
    return json.dumps(data_dict, cls=CustomJSONEncoder)


def encode_dict(data_dict):
    import json
        
    return json.loads(dict_to_json(data_dict))

def render_to(request, template, context):
    from django.shortcuts import render
    
    context["TEMPLATE_NAME"] = template
    return render(request, template, context=context)