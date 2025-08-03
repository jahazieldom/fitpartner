from django.db import models
from django.contrib.auth import get_user_model
from django.utils.functional import cached_property


class Customer(models.Model):
    user_id = models.IntegerField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

    @cached_property
    def user_obj(self):
        User = get_user_model()
        return User.objects.get(pk=self.user_id)