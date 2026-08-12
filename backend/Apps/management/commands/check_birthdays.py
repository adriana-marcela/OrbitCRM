from django.core.management.base import BaseCommand
from datetime import date, timedelta
from django.utils.timezone import now
from ...Usuario.models import User
from ...Notificaciones.models import Notification

class Command(BaseCommand):
    help = 'Revisa cumpleaños próximos y crea/actualiza notificación tipo evento'

    def handle(self, *args, **kwargs):
        today = date.today()
        upcoming_limit = today + timedelta(days=7)

        cumpleaños_hoy = []
        cumpleaños_proximos = []

        for user in User.objects.all():
            if user.birthday:
                birthday_this_year = user.birthday.replace(year=today.year)
                if birthday_this_year == today:
                    cumpleaños_hoy.append(f"🎉 Hoy cumple {user.get_full_name()}")
                elif today < birthday_this_year <= upcoming_limit:
                    days_left = (birthday_this_year - today).days
                    cumpleaños_proximos.append(f"🎂 {user.get_full_name()} cumple en {days_left} días")

        # Notificación: Cumpleaños Hoy
        if cumpleaños_hoy:
            message_hoy = "Cumpleaños de hoy:\n" + "\n".join(cumpleaños_hoy)
            noti_hoy, created = Notification.objects.get_or_create(
                type='event',
                user=None,
                message__startswith="Cumpleaños de hoy:",
                defaults={
                    'message': message_hoy,
                    'date': today
                }
            )
            if not created:
                noti_hoy.message = message_hoy
                noti_hoy.date = today
                noti_hoy.save()
            self.stdout.write(self.style.SUCCESS("Notificación de cumpleaños de hoy actualizada o creada."))

        # Notificación: Cumpleaños Próximos
        if cumpleaños_proximos:
            message_proximos = "Cumpleaños próximos:\n" + "<br>".join(cumpleaños_proximos)
            noti_prox, created = Notification.objects.get_or_create(
                type='event',
                user=None,
                message__startswith="Cumpleaños próximos:",
                defaults={
                    'message': message_proximos,
                    'date': today
                }
            )
            if not created:
                noti_prox.message = message_proximos
                noti_prox.date = today
                noti_prox.save()
            self.stdout.write(self.style.SUCCESS("Notificación de cumpleaños próximos actualizada o creada."))

        if not cumpleaños_hoy and not cumpleaños_proximos:
            self.stdout.write(self.style.WARNING("No hay cumpleaños hoy ni próximos."))
