from django.contrib.auth.decorators import login_required
from utils.functions import list_view
from .models import *
from .forms import *
from django.utils.translation import gettext_lazy as _
from utils.functions import render_to
from core.forms import FiltroForm
from django.shortcuts import redirect
from django.contrib import messages
from django.db.models import Q
from utils.functions import get_tenant
from django.utils import timezone
from django.template.loader import render_to_string
from django.urls import reverse
from django.http import JsonResponse
from payments.models import Payment

@login_required
def clients(request):
    objects = Client.objects.all()
    form = FiltroForm(request.GET or None)

    if form.is_valid():
        q = form.cleaned_data.get('q')
        fecha_desde = form.cleaned_data.get('fecha_desde')
        fecha_hasta = form.cleaned_data.get('fecha_hasta')

        if q:
            objects = objects.filter(
                Q(first_name__icontains=q) | 
                Q(last_name__icontains=q)
            )

        if fecha_desde:
            objects = objects.filter(created_at__gte=fecha_desde)

        if fecha_hasta:
            objects = objects.filter(created_at__lte=fecha_hasta)

    return list_view(
        request,
        objects,
        "clients/clients.html",
        {
            "title": "Clientes",
            "filtro_form": form,
        },
    )

@login_required
def delete_client(request, pk):
    instance = Client.objects.get(pk=pk)
    instance.user_obj.companies.filter(company=get_tenant()).delete()
    instance.user.delete()
    instance.delete()
    messages.success(request, "Los datos han sido guardados correctamente")
    return redirect('clients:clients') 

@login_required
def client(request, pk=None):
    title = "Agregar cliente"
    instance = Client(created_by=request.user, source='admin_panel')

    if pk:
        instance = Client.objects.get(pk=pk)
        title = f"Editar cliente: {instance.get_full_name()}"
    
    if request.method == 'POST':
        form = ClientForm(request.POST, request.FILES, instance=instance)
        if form.is_valid():

            form.instance.updated_by = request.user
            form.save()
            current_plan = form.instance.current_plan
            
            plan = form.cleaned_data.get("plan")

            if current_plan and form.cleaned_data.get("cancel_current_plan"):
                current_plan.cancelled_at = timezone.now()
                current_plan.cancelled_by = request.user
                current_plan.cancellation_comments = f"Cancelado desde editar cliente"
                current_plan.is_active = False
                current_plan.save()
                current_plan = None
                plan = None

            if plan and not current_plan:
                client_plan = ClientPlan(
                    client=form.instance,
                    plan=plan,
                    purchase_date=timezone.now(),
                    created_by=request.user,
                )
                client_plan.save()
                
            messages.success(request, "Los datos han sido guardados correctamente")
            
            if request.POST.get("redirect_back"):
                return redirect(".")
            
            return redirect('clients:clients') 
        messages.error(request, "Corrija los errores para continuar")
    else:
        form = ClientForm(instance=instance)

    context = {
        "title": title,
        "form": form
    }
    return render_to(request, "clients/client.html", context)

@login_required
def save_client_plan_payment(request, client_plan_pk):
    client_plan = ClientPlan.objects.get(pk=client_plan_pk)
    if client_plan.is_paid():
        messages.error(request, "El plan ya se encuentra pagado")
        return redirect("/")
    
    instance = None
    form = ClientPlanPaymentForm(request.POST, request.FILES, instance=instance)
    back_url = request.POST.get("back_url")

    if form.is_valid():
        form.instance.client_plan = client_plan
        form.instance.method = "manual"
        form.instance.created_by = request.user
        if form.instance.status == "paid":
            form.instance.paid_at = timezone.now()
        
        form.save()
        return redirect(back_url)
    
    messages.error(request, "Corrija los errores para continuar")
    return redirect(back_url)

@login_required
def get_client_plan_payment_form(request, client_plan_pk):
    client_plan = ClientPlan.objects.get(pk=client_plan_pk)
    instance = Payment(
        client_plan=client_plan,
        amount=client_plan.plan.price,
        status='paid',
        method='manual',
    )
    form = ClientPlanPaymentForm(instance=instance)
    html = render_to_string(
        "clients/client_plan_payment_form.html", 
        {
            "form": form, 
            "action_url": reverse("clients:save_client_plan_payment", args=[client_plan_pk]),
            "back_url": request.GET.get("back_url")
        },
        request=request
    )
    return JsonResponse({
        "html": html
    })