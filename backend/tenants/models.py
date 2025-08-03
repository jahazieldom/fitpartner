from django_tenants.models import TenantMixin, DomainMixin
from django_tenants.utils import schema_context
from django.db import models
from django.utils.functional import cached_property
from django.conf import settings

class Company(TenantMixin):
    name = models.CharField(max_length=255)
    paid_until = models.DateField(null=True, blank=True)
    on_trial = models.BooleanField(default=True)
    config = models.JSONField(default=dict, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    @cached_property
    def settings(self):
        if hasattr(self, "_settings_cache"):
            return self._settings_cache

        if self.schema_name == "public":
            return None

        from core.models import CompanySettings
        with schema_context(self.schema_name):
            self._settings_cache, _ = CompanySettings.objects.get_or_create(id=1)
        return self._settings_cache


class Domain(DomainMixin):
    pass

class UserCompany(models.Model):
    user_email = models.EmailField(db_index=True, max_length=255)
    password = models.CharField(max_length=128)
    company_schema_name = models.CharField(max_length=100, db_index=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    last_login = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["user_email", "company_schema_name"]]
        ordering = ["-id"]
        indexes = [
            models.Index(fields=["user_email", "company_schema_name"]),
        ]

    def __str__(self):
        return f"{self.user_email} ↔ {self.company_schema_name}"
    
    def get_company_name(self):
        return self.company_schema_name
    
    def get_base_url(self):
        return settings.TENANT_URL_TEMPLATE.format(self.company_schema_name)

    def get_company_name(self):
        return self.company_schema_name

    @cached_property
    def user_obj(self):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        with schema_context(self.company_schema_name):
            return User.objects.filter(email=self.user_email).first()



