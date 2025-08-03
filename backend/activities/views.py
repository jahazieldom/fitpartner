from django.contrib.auth.decorators import login_required
from utils.functions import list_view
from .models import ActivityTemplate, ActivitySession
from django.utils.translation import gettext_lazy as _
from utils.functions import render_to
from .forms import ActivityTemplateForm
from core.forms import FiltroForm
from datetime import timedelta
from django.shortcuts import redirect
from django.contrib import messages
from django.http import JsonResponse
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta, date
from django.template.loader import render_to_string
from django.urls import reverse
from django.db.models import Q

def generate_sessions_for_template(template, days_ahead=30):
    today = date.today()
    end_date = today + timedelta(days=days_ahead)

    # Calcular rango válido según el template
    start = max(today, template.start_date)
    final = min(end_date, template.end_date) if template.end_date else end_date
    
    # borrar solo las que no tengan asistencias
    # o clases apartadas
    template.sessions.all().delete()

    current = start
    while current <= final:
        if current.weekday() in template.weekdays:
            ActivitySession.objects.create(
                template=template,
                date=current,
                start_time=template.start_time,
                capacity=template.capacity,
            )
        current += timedelta(days=1)


@login_required
def activities(request):
    objects = ActivityTemplate.objects.all()
    form = FiltroForm(request.GET or None)

    if form.is_valid():
        q = form.cleaned_data.get('q')
        fecha_desde = form.cleaned_data.get('fecha_desde')
        fecha_hasta = form.cleaned_data.get('fecha_hasta')

        if q:
            objects = objects.filter(name__icontains=q)

        if fecha_desde:
            objects = objects.filter(created_at__gte=fecha_desde)

        if fecha_hasta:
            objects = objects.filter(created_at__lte=fecha_hasta)

    objects = objects.order_by(
        "name",
        "weekdays",
        "-start_time"
    )
    return list_view(
        request,
        objects,
        "activities/activities.html",
        {
            "title": "Clases",
            "filtro_form": form,
        },
    )

@login_required
def delete_activity(request, pk):
    instance = ActivityTemplate.objects.get(pk=pk)
    instance.delete()
    messages.success(request, "Los datos han sido guardados correctamente")
    return redirect('activities:activities') 

@login_required
def activity(request, pk=None):

    title = "Crear nueva clase"
    instance = ActivityTemplate(created_by=request.user)

    if pk:
        instance = ActivityTemplate.objects.get(pk=pk)
        title = f"Editar clase: {instance.name}"
    
    if request.method == 'POST':
        form = ActivityTemplateForm(request.POST, instance=instance)
        if form.is_valid():
            form.instance.updated_by = request.user
            template = form.save()
            generate_sessions_for_template(template)
            messages.success(request, "Los datos han sido guardados correctamente")
            return redirect('activities:activities') 
        messages.error(request, "Corrija los errores para continuar")
    else:
        form = ActivityTemplateForm(instance=instance)

    context = {
        "title": title,
        "form": form,
    }
    return render_to(request, "activities/activity.html", context)

@login_required
def calendar_events(request):
    start_str = request.GET.get("start")
    end_str = request.GET.get("end")

    start_date = parse_date(start_str) if start_str else None
    end_date = parse_date(end_str) if end_str else None

    sessions = ActivitySession.objects.filter(
        Q(is_cancelled=False) & Q(template__is_active=True)
    )

    if start_date:
        sessions = sessions.filter(date__gte=start_date)
    if end_date:
        sessions = sessions.filter(date__lte=end_date)

    events = []
    for session in sessions.select_related("template", "template__instructor"):
        start_dt = datetime.combine(session.date, session.start_time)
        duration = timedelta(minutes=session.template.duration_minutes)
        end_dt = start_dt + duration

        events.append({
            "id": session.id,
            "title": session.template.name,
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "capacity": session.capacity,
            "available_slots": session.available_slots,
            "instructor": session.template.instructor.get_full_name() if session.template.instructor else None,
            "backgroundColor": session.template.color_rgb,
        })

    return JsonResponse(events, safe=False)

@login_required
def get_activity_session_form(request, activity_template_id):
    instance = ActivityTemplate.objects.get(pk=activity_template_id)
    instance.id = None
    instance.start_time = None
    # instance.duration_minutes = None
    # instance.capacity = None
    form = ActivityTemplateForm(instance=instance)
    html = render_to_string(
        "activities/activity_form.html", 
        {
            "form": form, 
            "action_url": reverse("activities:activity"),
        },
        request=request
    )
    return JsonResponse({
        "html": html
    })