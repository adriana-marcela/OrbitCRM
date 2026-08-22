from django.core.management.base import BaseCommand
from ...Notificaciones.models import Notification
from ...Agenda.models import Schedule
from ...Clientes.models import  Client
from ...HistorialPagos.models import PaymentHistory
from ...Usuario.models import User
class Command(BaseCommand):
    help = ''
    def handle(self, *args, **kwargs):
        """Notification.objects.all().delete()
        Schedule.objects.all().delete()
        PaymentHistory.objects.all().delete()
        for client in Client.objects.all():
            client.delete()"""
        User.objects.filter(email="jhonharoldvelezorozco@gmail.com").first().delete()
        User.objects.filter(email="adrdd@gmail.com").first().delete()