from django.contrib.auth.decorators import login_required
from utils.functions import list_view
from .models import *
from .forms import *
from utils.functions import render_to
from core.forms import FiltroForm
from django.shortcuts import redirect
from django.contrib import messages
from django.conf import settings
from plans.models import Plan
from clients.models import Client, ClientPlan
from django.http import HttpResponseBadRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import stripe
from django.utils import timezone


@login_required
def payments(request):
    objects = Payment.objects.all().prefetch_related("client_plan__client", "client_plan__plan")
    form = FiltroForm(request.GET or None)

    if form.is_valid():
        fecha_desde = form.cleaned_data.get('fecha_desde')
        fecha_hasta = form.cleaned_data.get('fecha_hasta')

        if fecha_desde:
            objects = objects.filter(created_at__gte=fecha_desde)

        if fecha_hasta:
            objects = objects.filter(created_at__lte=fecha_hasta)

    return list_view(
        request,
        objects,
        "payments/payments.html",
        {
            "title": "Historial de pagos",
            "filtro_form": form,
        },
    )

@login_required
def payment(request, pk=None):
    title = "Agregar pago"
    instance = Payment(created_by=request.user)
    if pk:
        instance = Payment.objects.get(pk=pk)
        title = f"Editar pago: {instance.client}"
    
    if request.method == 'POST':
        form = PaymentForm(request.POST, request.FILES, instance=instance)
        if form.is_valid():
            form.instance.updated_by = request.user
            form.save()
            messages.success(request, "Los datos han sido guardados correctamente")
            return redirect('payments:payments') 
        messages.error(request, "Corrija los errores para continuar")
    else:
        form = PaymentForm(instance=instance)

    context = {
        "title": title,
        "form": form
    }
    return render_to(request, "payments/payment.html", context)

def stripe_payment_success(request):
    magic_link = f"muvon://payment-success"
    return redirect(magic_link)
    return HttpResponse({"success": True, "magic_link": magic_link})

def stripe_payment_cancel(request):
    magic_link = f"muvon://payment-cancel"
    return redirect(magic_link)
    return HttpResponse({"success": True, "magic_link": magic_link})

@csrf_exempt
def stripe_webhook(request):

    if not request.tenant.settings.stripe_enabled:
        return HttpResponse(status=200)

    stripe.api_key = request.tenant.settings.stripe_secret_key
    webhook_secret = request.tenant.settings.stripe_webhook_secret

    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return HttpResponseBadRequest(str(e))

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session['metadata']
        client_id = metadata.get('client_id')
        plan_id = metadata.get('plan_id')
        session_id = session['id']

        # Activar plan
        client_plan = ClientPlan.objects.filter(
            client_id=client_id,
            plan_id=plan_id,
            stripe_session_id=session_id
        ).first()

        if client_plan:
            client_plan.is_active = True
            client_plan.purchase_date = timezone.now()
            client_plan.save()
        else:
            # fallback si no se guardó antes
            client_plan = ClientPlan.objects.create(
                client_id=client_id,
                plan_id=plan_id,
                stripe_session_id=session_id,
                is_active=True,
                paid_at=timezone.now()
            )
        
        Payment.objects.create(
            client_plan=client_plan,
            amount=(session.get('amount_total', 0) or 0) / 100,  # Stripe da en centavos
            method='stripe',
            status='paid',
            transaction_id=session.get('payment_intent'),
            paid_at=timezone.now(),
        )

    return HttpResponse(status=200)