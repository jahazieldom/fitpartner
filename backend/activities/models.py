from core.models import BaseModel
from django.db import models
from datetime import datetime, timedelta, time
from django.utils.functional import cached_property


class Weekday(models.IntegerChoices):
    MONDAY = 0, "Lunes"
    TUESDAY = 1, "Martes"
    WEDNESDAY = 2, "Miércoles"
    THURSDAY = 3, "Jueves"
    FRIDAY = 4, "Viernes"
    SATURDAY = 5, "Sábado"
    SUNDAY = 6, "Domingo"

class ActivityTemplate(BaseModel):
    """
    Clase recurrente programada por día/horario.
    """
    BG_COLORS = [
        ('rgb(33, 37, 41)', 'Dark'),        # bg-dark
        # ('rgb(255, 255, 255)', 'White'),    # bg-white
        ('rgb(0, 108, 255)', 'Blue'),       # bg-blue
        ('rgb(56, 184, 242)', 'Azure'),     # bg-azure
        ('rgb(102, 16, 242)', 'Indigo'),    # bg-indigo
        ('rgb(111, 66, 193)', 'Purple'),    # bg-purple
        ('rgb(232, 62, 140)', 'Pink'),      # bg-pink
        ('rgb(220, 53, 69)', 'Red'),        # bg-red
        ('rgb(253, 126, 20)', 'Orange'),    # bg-orange
        ('rgb(255, 193, 7)', 'Yellow'),     # bg-yellow
        ('rgb(192, 255, 0)', 'Lime'),       # bg-lime
        ('rgb(40, 167, 69)', 'Green'),      # bg-green
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey("staff.Instructor", on_delete=models.SET_NULL, null=True, blank=True)
    weekdays = models.JSONField(default=list)  # Lista de días: [0, 2, 4]
    start_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    color_rgb = models.CharField(null=True, max_length=20, choices=BG_COLORS)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.name} ({self.start_time})"

    def get_week_days(self):
        return ", ".join(Weekday(w).label for w in self.weekdays)
    
    @cached_property
    def time_icon(self):
        """
        Devuelve un ícono de Tabler basado en la hora de inicio.
        """
        if time(5, 0) <= self.start_time < time(12, 0):
            return "sun"  # Mañana
        elif time(12, 0) <= self.start_time < time(18, 0):
            return "cloud-sun"  # Tarde
        else:
            return "moon"  # Noche


class ActivitySession(BaseModel):
    """
    Instancia real de una clase para un día específico.
    """
    template = models.ForeignKey(ActivityTemplate, on_delete=models.CASCADE, related_name="sessions")
    date = models.DateField()
    start_time = models.TimeField()
    capacity = models.PositiveIntegerField()
    is_cancelled = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("template", "date")

    def __str__(self):
        return f"{self.template.name} on {self.date}"

    @property
    def available_slots(self):
        return self.capacity - self.reservations.count()

    @property
    def end_time(self):
        return (datetime.combine(self.date, self.start_time) + timedelta(minutes=self.template.duration_minutes)).time()


class Reservation(BaseModel):
    """
    Reserva de un cliente para una sesión.
    """
    session = models.ForeignKey(ActivitySession, on_delete=models.CASCADE, related_name="reservations")
    client = models.ForeignKey("clients.Client", on_delete=models.CASCADE, related_name="reservations")
    reserved_at = models.DateTimeField(auto_now_add=True)
    checked_in = models.BooleanField(default=False)

    class Meta:
        unique_together = ("session", "client")

    def __str__(self):
        return f"{self.client} in {self.session}"

