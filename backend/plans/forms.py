from core.forms import FormControlMixin
from django import forms
from .models import *
from utils.functions import to_int

class PlanForm(FormControlMixin, forms.ModelForm):
    class Meta:
        model = Plan
        fields = [
            "name",
            "description",
            "price",
            "access_type",
            "access_value",
            "validity_type",
            "fixed_expiry_date",
            "validity_duration_months",
            "validity_duration_days",
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }
        labels = {
            "name": "Nombre del plan",
            "price": "Precio",
            "description": "Descripción",
            "access_type": "Tipo de acceso",
            "access_value": "Valor del acceso",
            "validity_type": "Tipo de vigencia",
            "validity_duration_months": "Meses de vigencia",
            "validity_duration_days": "Días de vigencia",
            "fixed_expiry_date": "Fecha fija de vencimiento",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["validity_duration_months"].required = False
        self.fields["validity_duration_days"].required = False
    
    def clean_validity_duration_months(self):
        val = self.cleaned_data.get("validity_duration_months")
        return to_int(val)
    
    def clean_validity_duration_days(self):
        val = self.cleaned_data.get("validity_duration_days")
        return to_int(val)
    