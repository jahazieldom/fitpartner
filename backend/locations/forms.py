from core.forms import FormControlMixin
from django import forms
from .models import *


class LocationForm(FormControlMixin, forms.ModelForm):
    contact_phone = forms.CharField(
        required=False,
        label="Teléfono de contacto",
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "data-mask": "(00) 0000-0000",
            "autocomplete": "off",
            "placeholder": "(00) 0000-0000",
        })
    )

    class Meta:
        model = Location
        fields = ['name', 'is_active', 'full_address', 'contact_name', 'contact_email', 'contact_phone']
        labels = {
            'name': 'Nombre',
            'full_address': 'Dirección completa',
            'contact_name': 'Nombre de contacto',
            'contact_email': 'Email de contacto',
            'contact_phone': 'Teléfono de contacto',
            'is_active': 'Activo',
        }
