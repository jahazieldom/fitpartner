from django import forms
from .models import MembershipPlan, Membership

class MembershipPlanForm(forms.ModelForm):
    class Meta:
        model = MembershipPlan
        fields = [
            'name',
            'type',
            'price',
            'duration_days',
            'credits',
            'expiration_days',
        ]

class MembershipForm(forms.ModelForm):
    class Meta:
        model = Membership
        fields = [
            'client',
            'plan',
            'start_date',
            'end_date',
            'credits_remaining',
            'is_active',
        ]
        