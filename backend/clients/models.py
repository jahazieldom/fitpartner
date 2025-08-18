from django.db import models
from django.contrib.auth import get_user_model
from django.utils.functional import cached_property
from core.models import BaseModel
from datetime import date
from django.utils import timezone
from plans.models import Plan

User = get_user_model()

class Client(BaseModel):
    source = models.CharField(max_length=100, null=True, choices=[('admin_panel', 'Admin panel'), ('mobile_app', 'App móvil')])
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

    @cached_property
    def user_obj(self):
        return User.objects.get(pk=self.user_id)
    
    def get_full_name(self):
        return self.user_obj.get_full_name()

    def get_age(self):
        if not self.birth_date:
            return None
        today = date.today()
        age = today.year - self.birth_date.year
        # Ajuste si aún no ha llegado el cumpleaños este año
        if (today.month, today.day) < (self.birth_date.month, self.birth_date.day):
            age -= 1
        return age
    
    @cached_property
    def current_plan(self):
        return self.plans.prefetch_related("plan").filter(is_active=True).first()
    
    def get_plans_history(self):
        current_plan_id = None
        if self.current_plan:
            current_plan_id = self.current_plan.id

        return self.plans.exclude(id=current_plan_id).prefetch_related("plan")

class ClientPlan(BaseModel):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="plans")
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="client_plans")

    purchase_date = models.DateField(auto_now_add=True)
    first_use_date = models.DateField(null=True, blank=True)

    remaining_sessions = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    cancelled_at = models.DateTimeField(null=True)
    cancelled_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    cancellation_comments = models.CharField(max_length=255, null=True)
    stripe_session_id = models.CharField(max_length=1000, null=True)

    class Meta:
        verbose_name = "Client Plan"
        verbose_name_plural = "Client Plans"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.client.get_full_name()} - {self.plan.name}"
    
    def set_remaining_sessions(self):
        if self.plan.access_type == "fixed_sessions":
            self.remaining_sessions = self.plan.access_value
            reserved = self.reservations.filter(cancelled_at__isnull=True).count()
            self.remaining_sessions -= reserved
        else:
            self.remaining_sessions = None

        self.save(update_fields=["remaining_sessions"])
    
    def get_payments(self):
        return self.payments.filter(status="paid")
    
    def get_total_paid(self):
        total = 0
        for payment in self.get_payments():
            total += payment.amount
        
        return total

    def is_paid(self):
        return self.plan.price <= self.get_total_paid()

    def set_status(self):
        today = timezone.now() 
        if self.expiration_date < today.date():
            self.is_active = False
            self.cancelled_at = today
            self.cancellation_comments = "Cancelación automática"
    
    @cached_property
    def expiration_date(self):
        return self.get_expiration_date()

    def get_expiration_date(self):
        if self.plan.validity_type == "no_expiry":
            return None
        ref_date = self.first_use_date or self.purchase_date
        return self.plan.get_expiry_date(ref_date)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
    
    def plan_expiry_description(self):
        expiry = self.get_expiration_date()
        if expiry:
            days = (expiry - date.today()).days
            return f"{self.plan.name} (expira en {days} días)"
        
        return f"{self.plan.name} (sin vencimiento)"