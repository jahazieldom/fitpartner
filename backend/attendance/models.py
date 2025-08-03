# attendance/models.py

from django.db import models
from core.models import BaseModel

class AttendanceMethod(models.TextChoices):
    MANUAL = 'manual', 'Manual'
    QR = 'qr', 'QR Code'
    NFC = 'nfc', 'NFC'
    APP = 'app', 'App Check-in'

class AttendanceRecord(BaseModel):
    session = models.ForeignKey("activities.ActivitySession", on_delete=models.CASCADE, related_name="attendances")
    client = models.ForeignKey("clients.Client", on_delete=models.CASCADE, related_name="attendances")
    reservation = models.ForeignKey("activities.Reservation", null=True, blank=True, on_delete=models.SET_NULL)
    check_in_time = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=AttendanceMethod.choices, default=AttendanceMethod.MANUAL)

    class Meta:
        unique_together = ("session", "client")

    def __str__(self):
        return f"{self.client} attended {self.session}"
