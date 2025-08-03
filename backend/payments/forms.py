from core.forms import FormControlMixin
from django import forms
from .models import *

class PaymentForm(FormControlMixin, forms.ModelForm):
    class Meta:
        model = Payment
        fields = [
            "client_plan",
            "amount",
            "method",
            "status",
            "transaction_id",
        ]