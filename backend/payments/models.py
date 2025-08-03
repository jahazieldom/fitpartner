# payments/models.py
from django.db import models
from core.models import BaseModel
from clients.models import ClientPlan
from django.utils.functional import cached_property

class Payment(BaseModel):
    PAYMENT_METHODS = [
        ('stripe', 'Stripe'),
        ('cash', 'Efectivo'),
        ('paypal', 'PayPal'),
        ('manual', 'Manual'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    client_plan = models.ForeignKey(ClientPlan, on_delete=models.CASCADE, null=True, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)  
    metadata = models.JSONField(blank=True, null=True)

    cancelled_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    @cached_property
    def client(self):
        if self.client_plan:
            return self.client_plan.client
        
    @cached_property
    def plan(self):
        if self.client_plan:
            return self.client_plan.plan