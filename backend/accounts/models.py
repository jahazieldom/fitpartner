# accounts/models.py (en shared/public)
from django.contrib.auth.models import AbstractUser
from django.db import models
from tenants.models import Company

class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username

    def get_initial_letter(self):
        name = self.first_name or ""
        
        if not name:
            name = self.username

        if name:
            return name[0].lower()
        
        return "?"

class UserCompany(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="companies")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="users")
    last_activity = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["id", ]
        verbose_name = "Company"
        verbose_name_plural = "Companies"