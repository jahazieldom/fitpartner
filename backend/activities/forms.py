# forms.py
from django import forms
from .models import ActivityTemplate, Weekday
from core.forms import FormControlMixin

class ActivityTemplateForm(FormControlMixin, forms.ModelForm):
    weekdays = forms.MultipleChoiceField(
        choices=Weekday.choices,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-selectgroup-input'}),
        label="Días de la semana"
    )

    class Meta:
        model = ActivityTemplate
        fields = [
            'name', 'description', 'instructor', 'weekdays',
            'start_time', 'duration_minutes', 'capacity',
            'start_date', 'end_date', 'is_active', 'color_rgb'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'instructor': forms.Select(attrs={'class': 'form-select'}),
            'start_time': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            'capacity': forms.NumberInput(attrs={'class': 'form-control'}),
            # 'start_date': forms.DateInput(
            #     format='%d/%m/%Y',
            #     attrs={
            #         'class': 'form-control datepicker-default',
            #         'autocomplete': 'off',
            #         'placeholder': 'dd/mm/yyyy',
            #     }
            # ),
            # 'end_date': forms.DateInput(
            #     format='%d/%m/%Y',
            #     attrs={
            #         'class': 'form-control datepicker-default',
            #         'autocomplete': 'off',
            #         'placeholder': 'dd/mm/yyyy',
            #     }
            # ),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['start_date'].input_formats = ['%d/%m/%Y']
        self.fields['end_date'].input_formats = ['%d/%m/%Y']

    def clean_weekdays(self):
        return list(map(int, self.cleaned_data['weekdays']))

class ActivitySessionForm(FormControlMixin, forms.Form):
    start_time = forms.TimeField(
        widget=forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
        label="Hora de inicio"
    )
    capacity = forms.IntegerField(label="Capacidad")
    duration_minutes = forms.IntegerField(label="Duración (min)")