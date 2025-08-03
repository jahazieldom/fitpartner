from core.forms import FormControlMixin
from django import forms
from .models import *


class InstructorForm(FormControlMixin, forms.ModelForm):
    phone = forms.CharField(
        required=False,
        label="Teléfono",
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "data-mask": "(00) 0000-0000",
            "autocomplete": "off",
            "placeholder": "(00) 0000-0000",
        })
    )

    class Meta:
        model = Instructor
        fields = ['photo', 'first_name', 'last_name', 'email', 'phone', 'bio', 'is_active']
        labels = {
            'photo': 'Foto',
            'first_name': 'Nombre',
            'last_name': 'Apellido',
            'email': 'Correo electrónico',
            'phone': 'Teléfono',
            'bio': 'Biografía',
            'is_active': 'Activo',
        }
        widgets = {
            'photo': forms.ClearableFileInput(attrs={'accept': 'image/*'}),
            'bio': forms.Textarea(attrs={'rows': 4}),
        }
