from django.db import models
from core.models import BaseModel

class Location(BaseModel):
    is_active = models.BooleanField(default=True)
    name = models.CharField(max_length=255)
    full_address = models.TextField(null=True, blank=True)

    contact_name = models.CharField(max_length=255, null=True, blank=True)
    contact_email = models.EmailField(max_length=255, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    lat = models.CharField(max_length=255, null=True, blank=True)
    lng = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ("name",)
    
    def __str__(self):
        return self.name