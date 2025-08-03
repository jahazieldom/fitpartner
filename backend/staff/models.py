from django.db import models
from core.models import BaseModel


class Instructor(BaseModel):
    photo = models.ImageField(upload_to="staff/", null=True, blank=True)
    first_name = models.CharField("Nombre", max_length=255)
    last_name = models.CharField("Apellido", max_length=255)
    email = models.EmailField("Correo electrónico", null=True, blank=True)
    phone = models.CharField("Teléfono", max_length=20, blank=True, null=True)
    bio = models.TextField("Biografía", blank=True, null=True)
    is_active = models.BooleanField("Activo", default=True)

    def __str__(self):
        return self.get_full_name()
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_initial_letter(self):
        return (self.get_full_name() or self.email).upper().strip()[0]