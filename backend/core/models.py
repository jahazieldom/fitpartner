from django.db import models
from accounts.models import User
from django.urls import reverse


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name="%(class)s_creations",
        on_delete=models.PROTECT,
    )
    updated_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name="%(class)s_modifications",
        on_delete=models.PROTECT,
    )

    class Meta:
        abstract = True

class CompanySettings(models.Model):
    logo = models.ImageField(upload_to="logos", null=True, blank=True)
    contact_name = models.CharField(max_length=255, null=True, blank=True)
    contact_email = models.EmailField(max_length=255, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    full_address = models.TextField(null=True, blank=True)
    lat = models.CharField(max_length=255, null=True, blank=True)
    lng = models.CharField(max_length=255, null=True, blank=True)
    stripe_enabled = models.BooleanField(default=False)
    stripe_secret_key = models.CharField(max_length=255, blank=True, null=True)
    stripe_publishable_key = models.CharField(max_length=255, blank=True, null=True)
    stripe_webhook_secret = models.CharField(max_length=255, blank=True, null=True)

    def get_stripe_webhook_url(self, request=None):
        path = reverse("payments:stripe_webhook")
        if not request:
            return path
        return request.build_absolute_uri(path)

class CompanyLocation(BaseModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    full_address = models.TextField(null=True, blank=True)
    lat = models.CharField(max_length=255, null=True, blank=True)
    lng = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ["name"]
