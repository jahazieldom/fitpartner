from django.contrib.auth.decorators import login_required
from utils.functions import list_view
from .models import *
from .forms import *
from django.utils.translation import gettext_lazy as _
from utils.functions import render_to
from core.forms import FiltroForm
from django.shortcuts import redirect
from django.contrib import messages

@login_required
def instructors(request):
    objects = Instructor.objects.all()
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

    return list_view(
        request,
        objects,
        "staff/instructors.html",
        {
            "title": "Instructores",
            "filtro_form": form,
        },
    )

@login_required
@login_required
def delete_instructor(request, pk):
    instance = Instructor.objects.get(pk=pk)
    instance.delete()
    messages.success(request, "Los datos han sido guardados correctamente")
    return redirect('staff:instructors') 

def instructor(request, pk=None):
    title = "Agregar instructor"
    instance = Instructor(created_by=request.user)
    if pk:
        instance = Instructor.objects.get(pk=pk)
        title = f"Editar instructor: {instance.get_full_name()}"
    
    if request.method == 'POST':
        form = InstructorForm(request.POST, request.FILES, instance=instance)
        if form.is_valid():
            form.instance.updated_by = request.user
            form.save()
            messages.success(request, "Los datos han sido guardados correctamente")
            return redirect('staff:instructors') 
        messages.error(request, "Corrija los errores para continuar")
    else:
        form = InstructorForm(instance=instance)

    context = {
        "title": title,
        "form": form
    }
    return render_to(request, "staff/instructor.html", context)