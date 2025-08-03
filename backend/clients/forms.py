from django import forms
from core.forms import FormControlMixin
from django.contrib.auth import get_user_model
from .models import *
from plans.models import Plan
from payments.models import Payment
from accounts.models import UserCompany
from utils.functions import get_tenant
from datetime import date
import locale

try:
    locale.setlocale(locale.LC_TIME, 'es_MX.UTF-8')
except Exception as e:
    pass

User = get_user_model()

class ClientForm(FormControlMixin, forms.ModelForm):
    # Solo mostrar campos del usuario si el cliente aún no está vinculado a uno
    email = forms.EmailField(required=False)
    password = forms.CharField(label='Contraseña', widget=forms.PasswordInput, required=False)
    birth_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            "class": "form-control datepicker-default",
            "placeholder": "dd/mm/yyyy"
        }),
    )

    MONTHS = [(i, date(2000, i, 1).strftime('%B').title()) for i in range(1, 13)]
    DAY_CHOICES = [(i, str(i)) for i in range(1, 32)]
    YEAR_CHOICES = [(y, str(y)) for y in range(date.today().year, 1900, -1)]

    birth_day = forms.ChoiceField(choices=[('', 'Día')] + DAY_CHOICES, required=False)
    birth_month = forms.ChoiceField(choices=[('', 'Mes')] + MONTHS, required=False)
    birth_year = forms.ChoiceField(choices=[('', 'Año')] + YEAR_CHOICES, required=False)

    phone = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "data-mask": "(00) 0000-0000",
            "autocomplete": "off",
            "placeholder": "(00) 0000-0000",
        })
    )

    cancel_current_plan = forms.BooleanField(required=False)
    plan = forms.ModelChoiceField(queryset=Plan.objects.none(), required=False, empty_label="Sin plan")

    class Meta:
        model = Client
        fields = ['first_name', 'last_name', 'email', 'phone', 'birth_date']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["plan"].queryset = Plan.objects.all()
        self.fields["plan"].label_from_instance = lambda obj: f"{obj.name} - ${obj.price} MXN"

        birth_date = None
        client_plan = None

        if 'initial' in kwargs:
            birth_date = kwargs['initial'].get('birth_date')
            client_plan = kwargs['initial'].get('client_plan')
        elif self.instance and self.instance.birth_date:
            birth_date = self.instance.birth_date
            client_plan = self.instance.current_plan

        if client_plan:
            self.fields['plan'].initial = client_plan.plan_id

        if isinstance(birth_date, date):
            self.fields['birth_day'].initial = birth_date.day
            self.fields['birth_month'].initial = birth_date.month
            self.fields['birth_year'].initial = birth_date.year

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        year = cleaned_data.get('birth_year')
        month = cleaned_data.get('birth_month')
        day = cleaned_data.get('birth_day')

        birth_date = None

        if any([year, month, day]):
            if not (year and month and day):
                self.add_error('birth_date', f"Ingrese una fecha de cumpleaños completa")
                return

            try:
                birth_date = date(int(year), int(month), int(day))
            except ValueError as e:
                self.add_error('birth_date', f"Fecha inválida: {e}")
        

        cleaned_data['birth_date'] = birth_date

        if not self.instance.pk:
            if not password:
                self.add_error('password', "La contraseña es obligatoria.")

            if not email:
                self.add_error('email', "El correo electrónico es obligatorio.")

            if email and User.objects.filter(email=email).exists():
                self.add_error('email', "Este correo ya está registrado.")

        return cleaned_data

    def save(self, commit=True):
        # Si ya existe un user_id, no crear usuario
        creating = not self.instance.pk or not self.instance.user_id

        if creating:
            # Crear el usuario solo si no existe
            user = User.objects.create_user(
                username=self.cleaned_data.get('email'),
                email=self.cleaned_data.get('email'),
                password=self.cleaned_data['password'],
                first_name=self.cleaned_data['first_name'],
                last_name=self.cleaned_data['last_name'],
            )
            UserCompany.objects.create(user=user, company=get_tenant())
            self.instance.user = user
        
        else:
            # Actualizar datos de usuario existente
            user = User.objects.get(pk=self.instance.user_id)
            user.first_name = self.cleaned_data['first_name']
            user.last_name = self.cleaned_data['last_name']
            # Opcionalmente actualiza email si quieres:
            user.email = self.cleaned_data.get('email', user.email)
            user.save()

        return super().save(commit=commit)

class ClientPlanPaymentForm(FormControlMixin, forms.ModelForm):
    class Meta:
        model = Payment
        fields = [
            "status",
            "amount",
        ]
        labels = {
            "amount": "Importe",
            "status": "Status"
        }