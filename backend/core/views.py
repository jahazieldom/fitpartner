from django.shortcuts import render, redirect
from .forms import EmailLoginForm, GeneralSettingsForm, PaymentSettingsForm
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_str
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import CompanySettings
from utils.functions import get_tenant
from django.shortcuts import redirect

def logout_view(request):
    logout(request)
    return redirect('/') 

def password_reset_request(request):
    if request.method == "POST":
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            associated_users = User.objects.filter(email=email)
            if associated_users.exists():
                for user in associated_users:
                    subject = "Password Reset Requested"
                    email_template_name = "core/password_reset_email.html"
                    c = {
                        "email": user.email,
                        'domain': request.get_host(),
                        'site_name': 'YourSite',
                        "uid": urlsafe_base64_encode(str(user.pk).encode()).decode(),
                        "user": user,
                        'token': default_token_generator.make_token(user),
                        'protocol': 'https' if request.is_secure() else 'http',
                    }
                    email_body = render_to_string(email_template_name, c)
                    send_mail(subject, email_body, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
                messages.success(request, 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.')
                return redirect('password_reset_done')
            else:
                messages.error(request, 'No existe usuario registrado con ese correo.')
    else:
        form = PasswordResetForm()
    return render(request, 'core/password_reset_form.html', {'form': form})


def password_reset_done(request):
    return render(request, 'core/password_reset_done.html')


def password_reset_confirm(request, uidb64=None, token=None):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            form = SetPasswordForm(user, request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, 'Tu contraseña ha sido cambiada exitosamente.')
                return redirect('password_reset_complete')
        else:
            form = SetPasswordForm(user)
        return render(request, 'core/password_reset_confirm.html', {'form': form})
    else:
        messages.error(request, 'El enlace de restablecimiento no es válido, por favor solicita uno nuevo.')
        return redirect('password_reset')

def password_reset_complete(request):
    return render(request, 'core/password_reset_complete.html')

def email_login_view(request):
    if request.method == "POST":
        form = EmailLoginForm(request.POST)
        if form.is_valid():
            login(request, form.cleaned_data['user'])
            return redirect('home')  # cambia al nombre de tu vista principal
    else:
        form = EmailLoginForm()
    return render(request, 'core/login.html', {'form': form})

@login_required
def home(request):
    return render(request, 'activities/calendar.html', {"title": "Inicio"})

@user_passes_test(lambda u: u.is_superuser)
@login_required
def general_settings(request):
    instance = request.tenant.settings
    form = GeneralSettingsForm(instance=instance)
    if request.method == "POST":
        form = GeneralSettingsForm(request.POST, request.FILES, instance=instance)
        if form.is_valid():
            form.save()
            tenant = get_tenant()
            tenant.name = form.instance.name
            tenant.save(update_fields=["name"])

            messages.success(request, "Los datos han sido guardados correctamente")
            return redirect(".")

    return render(request, 'core/general_settings.html', {
        "title": "Configuración general", 
        "form": form,
        "tab": "general"
    })

@user_passes_test(lambda u: u.is_superuser)
@login_required
def payment_settings(request):
    instance = request.tenant.settings
    form = PaymentSettingsForm(instance=instance)
    if request.method == "POST":
        form = PaymentSettingsForm(request.POST, instance=instance)
        if form.is_valid():
            form.save()
            messages.success(request, "Los datos han sido guardados correctamente")
            return redirect(".")
            
    return render(request, 'core/payment_settings.html', {
        "title": "Configuración pasarela de pagos", 
        "form": form,
        "tab": "payments",
        "webhook_url": instance.get_stripe_webhook_url(request=request)
    })