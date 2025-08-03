from core.models import BaseModel
from django.db import models
from django.utils.translation import gettext_lazy as _
from datetime import date
from dateutil.relativedelta import relativedelta


class ValidityType(models.TextChoices):
    NO_EXPIRY = "no_expiry", _("Sin vencimiento")
    FROM_PURCHASE = "from_purchase", _("Desde la fecha de compra")
    FROM_FIRST_USE = "from_first_use", _("Desde el primer uso")
    CALENDAR_MONTH = "calendar_month", _("Por mes calendario")
    FIXED_DATE = "fixed_date", _("Fecha fija")


class AccessType(models.TextChoices):
    UNLIMITED = "unlimited", _("Ilimitado")
    FIXED_SESSIONS = "fixed_sessions", _("Número fijo de sesiones")
    FIXED_DAYS = "fixed_days", _("Número fijo de días")

class Plan(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stripe_price_id = models.CharField(max_length=100, blank=True, null=True)


    access_type = models.CharField(max_length=20, choices=AccessType.choices)
    access_value = models.PositiveIntegerField(null=True, blank=True)

    validity_type = models.CharField(max_length=20, choices=ValidityType.choices)
    fixed_expiry_date = models.DateField(null=True, blank=True)

    validity_duration_months = models.PositiveIntegerField(default=1)
    validity_duration_days = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name

    def get_expiry_date(self, reference_date: date) -> date | None:
        if self.validity_type == ValidityType.NO_EXPIRY:
            return None
        elif self.validity_type == ValidityType.FROM_PURCHASE:
            return reference_date + relativedelta(
                months=self.validity_duration_months,
                days=self.validity_duration_days
            )
        elif self.validity_type == ValidityType.FROM_FIRST_USE:
            return None  # Calculas luego cuando use por primera vez
        elif self.validity_type == ValidityType.CALENDAR_MONTH:
            import calendar
            last_day = calendar.monthrange(reference_date.year, reference_date.month)[1]
            return date(reference_date.year, reference_date.month, last_day)
        elif self.validity_type == ValidityType.FIXED_DATE:
            return self.fixed_expiry_date
        return None
    
    def expiration_label(self):
        output = []
        
        if self.validity_duration_months:
            if self.validity_duration_months > 1:
                output.append(f"{self.validity_duration_months} meses")
            else:
                output.append(f"{self.validity_duration_months} mes")
        
        if self.validity_duration_days:
            if output:
                output.append("y")

            if self.validity_duration_days > 1:
                output.append(f"{self.validity_duration_days} días")
            else:
                output.append(f"{self.validity_duration_days} día")
        
        output.append(self.get_validity_type_display().lower())

        return " ".join(output)