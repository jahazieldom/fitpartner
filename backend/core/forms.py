from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.forms import PasswordResetForm
from utils.functions import get_tenant
from .models import CompanySettings

class FormControlMixin:
    """
    Mixin para agregar 'form-control' a los widgets de entrada de texto,
    selects, textareas, fechas y datetimes. También asigna formato e input_formats
para DateInput y DateTimeInput automáticamente.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field_name, field in self.fields.items():
            widget = field.widget
            css_classes = widget.attrs.get('class', '')

            # Aplica estilos comunes
            if isinstance(widget, (
                forms.TextInput,
                forms.EmailInput,
                forms.Textarea,
                forms.Select,
                forms.NumberInput,
                forms.PasswordInput,
                forms.DateInput,
                forms.DateTimeInput,
                forms.ClearableFileInput,
            )):
                # Asegura 'form-control'
                if 'form-control' not in css_classes:
                    widget.attrs['class'] = (css_classes + ' form-control').strip()

                # DateInput específico
                if isinstance(widget, forms.DateInput):
                    widget.attrs['autocomplete'] = 'off'
                    if 'datepicker-default' not in widget.attrs.get('class', ''):
                        widget.attrs['class'] += ' datepicker-default'
                    # Asigna formato si no se especificó
                    if not hasattr(widget, 'format') or not widget.format:
                        widget.format = '%d/%m/%Y'
                    field.input_formats = ['%d/%m/%Y']

                # DateTimeInput específico
                if isinstance(widget, forms.DateTimeInput):
                    widget.attrs['autocomplete'] = 'off'

                    if 'datepicker-default' not in widget.attrs.get('class', ''):
                        widget.attrs['class'] += ' datepicker-default'

                    if not hasattr(widget, 'format') or not widget.format:
                        widget.format = '%d/%m/%Y %H:%M'
                    field.input_formats = ['%d/%m/%Y %H:%M']

            # Checkbox input
            elif isinstance(widget, forms.CheckboxInput):
                if 'form-check-input' not in css_classes:
                    widget.attrs['class'] = (css_classes + ' form-check-input').strip()


class CustomPasswordResetForm(PasswordResetForm):
    email = forms.EmailField(
        max_length=254,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email'
        })
    )


class EmailLoginForm(forms.Form):
    email = forms.EmailField(
        label=_("Email"),
        widget=forms.EmailInput(attrs={"class": "form-control", "placeholder": "Email", "autofocus": "true"})
    )
    password = forms.CharField(
        label=_("Password"),
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Password"})
    )

    def clean(self):
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')
        user = authenticate(email=email, password=password)

        if user is None:
            raise forms.ValidationError(_("[ERR00] Nombre de usuario o contraseña incorrectos"))
    
        self.cleaned_data['user'] = user
        return self.cleaned_data

class FiltroForm(forms.Form):
    q = forms.CharField(
        required=False,
        label='Buscar',
        widget=forms.TextInput(attrs={
            'placeholder': 'Buscar por texto...',
            'class': 'form-control',
        })
    )
    fecha_desde = forms.DateField(
        required=False,
        label='Fecha desde',
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'form-control',
        })
    )
    fecha_hasta = forms.DateField(
        required=False,
        label='Fecha hasta',
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'form-control',
        })
    )
    page_size = forms.ChoiceField(
        required=False,
        label='Registros por página',
        choices=[('25', '25'), ('50', '50'), ('100', '100')],
        initial='25',
        widget=forms.Select(attrs={
            'class': 'form-select',
        })
    )

class GeneralSettingsForm(FormControlMixin, forms.ModelForm):
    class Meta:
        model = CompanySettings
        fields = [
            "logo",
            "name",
            "contact_name",
            "contact_email",
            "contact_phone",
            "full_address",
            "lat",
            "lng",
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["logo"].required = False

class PaymentSettingsForm(FormControlMixin, forms.ModelForm):
    class Meta:
        model = CompanySettings
        fields = [
            "stripe_enabled",
            "stripe_secret_key",
            "stripe_publishable_key",
            "stripe_webhook_secret",
        ]

    def clean(self):
        cleaned_data = super().clean()
        stripe_enabled = cleaned_data.get("stripe_enabled")

        if stripe_enabled:
            secret_key = cleaned_data.get("stripe_secret_key")
            publishable_key = cleaned_data.get("stripe_publishable_key")
            webhook_secret = cleaned_data.get("stripe_webhook_secret")

            missing = []
            if not secret_key:
                missing.append("clave secreta")
            if not publishable_key:
                missing.append("clave pública")
            if not webhook_secret:
                missing.append("secreto del webhook")

            if missing:
                raise forms.ValidationError(
                    f"No puedes habilitar Stripe sin especificar: {', '.join(missing)}."
                )

        return cleaned_data
