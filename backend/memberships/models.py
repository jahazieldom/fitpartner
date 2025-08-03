from django.db import models

class MembershipPlanType(models.TextChoices):
    TIME = "time", "Time-based"
    CREDITS = "credits", "Credits-based"

class MembershipPlan(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=20,
        choices=MembershipPlanType.choices,
        default=MembershipPlanType.TIME
    )
    price = models.DecimalField(max_digits=8, decimal_places=2)

    # Solo para planes de tipo "time"
    duration_days = models.PositiveIntegerField(null=True, blank=True)

    # Solo para planes de tipo "credits"
    credits = models.PositiveIntegerField(null=True, blank=True)
    expiration_days = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class Membership(models.Model):
    client = models.ForeignKey("clients.Client", on_delete=models.CASCADE)
    plan = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    credits_remaining = models.PositiveIntegerField(null=True, blank=True)
