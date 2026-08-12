from django.db import models
from ..Usuario.models import User
from django.core.mail import send_mail
from django.conf import settings

NOTIFICACION_TYPES = [
    ('info', 'Informativo'),
    ('event', 'Evento'),
]

class Notification(models.Model):
    message = models.CharField(max_length=255)
    date = models.DateField()
    type = models.CharField(
        choices=NOTIFICACION_TYPES, 
        default='info',
        max_length=5,
        verbose_name='Tipo de notificacion'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True,blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Guardar la notificación
        super().save(*args, **kwargs)

        if self.type == 'info' and self.user:
            from_email = settings.NOTIF_FROM_EMAIL
            subject = "Nueva notificación"
            message = self.message
            recipient_list = [self.user.email]

            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )