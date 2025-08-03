from django.core.management.base import BaseCommand
from clients.models import ClientPlan


class Command(BaseCommand):
    help = 'Actualiza el estado de todos los ClientPlan activos llamando a set_status()'

    def handle(self, *args, **kwargs):
        count = 0

        for plan in ClientPlan.objects.filter(is_active=True):
            plan.set_status()
            if not plan.is_active:
                plan.save()
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Se actualizaron {count} ClientPlan activos.'))
