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
from django.conf import settings
import stripe


@login_required
def plans(request):
    objects = Plan.objects.all()
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
        "plans/plans.html",
        {
            "title": "Planes",
            "filtro_form": form,
        },
    )

@login_required
def delete_plan(request, pk):
    instance = Plan.objects.get(pk=pk)
    instance.delete()
    messages.success(request, "Los datos han sido guardados correctamente")
    return redirect('plans:plans') 

@login_required
def plan(request, pk=None):
    title = "Agregar plan"
    instance = Plan(created_by=request.user)

    if request.tenant.settings.stripe_enabled:
        stripe.api_key = request.tenant.settings.stripe_secret_key

    if pk:
        instance = Plan.objects.get(pk=pk)
        title = f"Editar plan: {instance.name}"

    if request.method == 'POST':
        form = PlanForm(request.POST, request.FILES, instance=instance)
        if form.is_valid():
            plan = form.save(commit=False)
            plan.updated_by = request.user
            
            # Guardar primero localmente para tener pk
            plan.save()

            # Verificar si el precio cambió
            original = Plan.objects.filter(pk=plan.pk).first()
            price_changed = "price" in form.changed_data
            
            # Crear o actualizar producto y precio en Stripe
            if request.tenant.settings.stripe_enabled and (not plan.stripe_price_id or price_changed):
                # Crear product en Stripe solo si no existe (primera vez)
                stripe_product_id = None
                if not original or not original.stripe_price_id:
                    stripe_product = stripe.Product.create(name=plan.name)
                    stripe_product_id = stripe_product.id
                else:
                    # Obtener product_id del price anterior
                    old_price = stripe.Price.retrieve(original.stripe_price_id)
                    stripe_product_id = old_price.product

                # Crear nuevo price con el precio actualizado
                stripe_price = stripe.Price.create(
                    product=stripe_product_id,
                    unit_amount=int(plan.price * 100),  # centavos
                    currency="mxn",
                )

                # Guardar nuevo price_id en el plan
                plan.stripe_price_id = stripe_price.id
                plan.save()

            messages.success(request, "Los datos han sido guardados correctamente")
            return redirect('plans:plans') 
        messages.error(request, "Corrija los errores para continuar")
    else:
        form = PlanForm(instance=instance)

    context = {
        "title": title,
        "form": form
    }
    return render_to(request, "plans/plan.html", context)