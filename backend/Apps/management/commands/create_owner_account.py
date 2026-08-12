import getpass
from django.core.management.base import BaseCommand, CommandError
from ...Usuario.models import User, Role, CustomPermission


class Command(BaseCommand):
    help = (
        "Crea (o actualiza) tu cuenta personal como propietaria del CRM, con el "
        "rol 'Super Admin' (todos los permisos: crear, editar y eliminar). "
        "Requiere haber corrido antes 'create_rol_and_permissions'."
    )

    def add_arguments(self, parser):
        parser.add_argument("--email", type=str, help="Correo con el que vas a iniciar sesión.")
        parser.add_argument("--password", type=str, help="Contraseña (si no se pasa, se pedirá de forma oculta).")
        parser.add_argument("--name", type=str, default="", help="Tu nombre.")
        parser.add_argument("--lastname", type=str, default="", help="Tu apellido.")

    def handle(self, *args, **options):
        super_admin_role = Role.objects.filter(name="Super Admin").first()
        if not super_admin_role or not CustomPermission.objects.exists():
            raise CommandError(
                "No existe el rol 'Super Admin' ni los permisos base. "
                "Corre primero: python manage.py create_rol_and_permissions"
            )

        email = options.get("email") or input("Correo para tu cuenta de propietaria: ").strip()
        if not email:
            raise CommandError("Debes indicar un correo.")

        password = options.get("password")
        if not password:
            password = getpass.getpass("Contraseña: ")
            password_confirm = getpass.getpass("Confirma la contraseña: ")
            if password != password_confirm:
                raise CommandError("Las contraseñas no coinciden.")
        if len(password) < 8:
            raise CommandError("Usa una contraseña de al menos 8 caracteres.")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "name": options.get("name", ""),
                "lastname": options.get("lastname", ""),
                "is_staff": True,
                "is_superuser": True,
                "rol": super_admin_role,
            },
        )
        user.is_staff = True
        user.is_superuser = True
        user.rol = super_admin_role
        if options.get("name"):
            user.name = options["name"]
        if options.get("lastname"):
            user.lastname = options["lastname"]
        user.set_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f"\n{'Creada' if created else 'Actualizada'} tu cuenta de propietaria: {email}\n"
            "Rol: Super Admin (acceso completo: crear, editar y eliminar en todos los módulos)."
        ))
