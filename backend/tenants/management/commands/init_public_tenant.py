# tenants/management/commands/init_public_tenant.py

from django.core.management.base import BaseCommand
from tenants.models import Company, Domain


class Command(BaseCommand):
    help = 'Crea el registro del tenant "public" en el modelo Company y su dominio si no existen.'

    def handle(self, *args, **options):
        tenant, tenant_created = Company.objects.get_or_create(
            schema_name='public',
            defaults={
                'name': 'Admin Company',
                'paid_until': None,
                'on_trial': False,
            }
        )

        if tenant_created:
            self.stdout.write(self.style.SUCCESS('✅ Tenant "public" creado en Company.'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Tenant "public" ya existía en Company.'))

        domain, domain_created = Domain.objects.get_or_create(
            domain='localhost',
            defaults={
                'tenant': tenant,
                'is_primary': True
            }
        )

        if domain_created:
            self.stdout.write(self.style.SUCCESS('✅ Dominio "localhost" creado para el tenant "public".'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Dominio "localhost" ya existía para algún tenant.'))
