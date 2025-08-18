from django.contrib import admin
from .models import *


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'get_date', 'reserved_at')
    list_display_links = list_display

    # Método que devuelve la fecha de la sesión
    def get_date(self, obj):
        return obj.session.date  # igual que tu serializer

    get_date.short_description = 'Date'  # nombre que se muestra en la columna