from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from ...Usuario.models import User, Role, CustomPermission
from ...Clientes.models import Client, ClientService
from ...Servicios.models import Services
from ...HistorialPagos.models import PaymentHistory

DEMO_EMAIL = "demo@orbitcrm.com"
DEMO_PASSWORD = "Demo2025!"


class Command(BaseCommand):
    help = (
        "Crea un usuario de demostración (solo lectura) y datos ficticios de "
        "clientes, servicios y pagos para que cualquiera pueda explorar el CRM "
        "sin arriesgar información real. Requiere haber corrido antes "
        "'create_rol_and_permissions'."
    )

    def handle(self, *args, **kwargs):
        colaborador_role = Role.objects.filter(name="Colaborador").first()
        if not colaborador_role or not CustomPermission.objects.exists():
            self.stdout.write(self.style.ERROR(
                "No existe el rol 'Colaborador' ni los permisos base. "
                "Corre primero: python manage.py create_rol_and_permissions"
            ))
            return

        # 1) Usuario demo de solo lectura ------------------------------------
        demo_user, created = User.objects.get_or_create(
            email=DEMO_EMAIL,
            defaults={
                "name": "Usuario",
                "lastname": "Demo",
                "is_staff": True,
                "rol": colaborador_role,
            },
        )
        demo_user.rol = colaborador_role
        demo_user.set_password(DEMO_PASSWORD)
        demo_user.save()
        self.stdout.write(self.style.SUCCESS(
            f"{'Creado' if created else 'Actualizado'} usuario demo: {DEMO_EMAIL} / {DEMO_PASSWORD} "
            f"(rol: Colaborador, solo lectura)"
        ))

        # 2) Servicios ficticios ----------------------------------------------
        servicios_demo = [
            {"name": "Diseño de sitio web", "description": "Sitio institucional responsivo.", "category": "Constructor"},
            {"name": "Mantenimiento mensual", "description": "Soporte y actualizaciones periódicas.", "category": "Complemento"},
            {"name": "Tienda en línea", "description": "Plataforma de comercio electrónico.", "category": "Constructor"},
        ]
        servicios = []
        for data in servicios_demo:
            service, _ = Services.objects.get_or_create(name=data["name"], defaults=data)
            servicios.append(service)
        self.stdout.write(self.style.SUCCESS(f"Servicios de muestra listos ({len(servicios)})."))

        # 3) Clientes ficticios -------------------------------------------------
        clientes_demo = [
            {"name": "Carolina", "lastname": "Restrepo", "documentNumber": "1000000001", "email": "carolina.restrepo@demo.orbitcrm.com", "city": "Bogotá"},
            {"name": "Julián", "lastname": "Moreno", "documentNumber": "1000000002", "email": "julian.moreno@demo.orbitcrm.com", "city": "Medellín"},
            {"name": "Valeria", "lastname": "Ortiz", "documentNumber": "1000000003", "email": "valeria.ortiz@demo.orbitcrm.com", "city": "Cali"},
        ]
        clientes = []
        for data in clientes_demo:
            client, _ = Client.objects.get_or_create(email=data["email"], defaults=data)
            clientes.append(client)
        self.stdout.write(self.style.SUCCESS(f"Clientes de muestra listos ({len(clientes)})."))

        # 4) Servicios contratados por cliente + pagos ---------------------------
        today = timezone.now().date()
        for i, client in enumerate(clientes):
            service = servicios[i % len(servicios)]
            client_service, _ = ClientService.objects.get_or_create(
                client=client,
                service=service,
                defaults={
                    "startDate": today - timedelta(days=30 * (i + 1)),
                    "expirationDate": today + timedelta(days=30),
                    "currency": "COP",
                    "price": 250000 + i * 50000,
                    "is_recurrent": True,
                    "recurrence": "Mensual",
                    "is_payed": i % 2 == 0,
                },
            )
            PaymentHistory.objects.get_or_create(
                client=client,
                service=service,
                clientService=client_service,
                date=today - timedelta(days=15 * (i + 1)),
                defaults={
                    "currency": "COP",
                    "price": client_service.price,
                    "is_payed": True,
                },
            )
        self.stdout.write(self.style.SUCCESS("Servicios contratados y pagos de muestra listos."))

        self.stdout.write(self.style.SUCCESS(
            "\nListo. Inicia sesión con:\n"
            f"  Correo:      {DEMO_EMAIL}\n"
            f"  Contraseña:  {DEMO_PASSWORD}\n"
            "Este usuario solo puede ver información (no crear, editar ni eliminar)."
        ))
