from django.db import models
from ..Clientes.models import Client

ACCESS_tYPE = [
    ('H','Herramienta'),
    ('S','Social'),
    ('C','Complemento'),
    ('T','Temas'),
    ('O','Otros'),

]

class Access(models.Model):
    name = models.CharField(max_length=30, blank=True)
    user = models.CharField(max_length=30, blank=True)
    password = models.CharField(max_length=30, blank=True)
    url = models.CharField(blank=True, max_length=255)
    pin = models.CharField(max_length=30, blank=True)
    type = models.CharField(
        choices=ACCESS_tYPE, 
        default='s',
        max_length=12,
        verbose_name='Tipo de Acceso'
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    #interno
    updated_at = models.DateTimeField(auto_now=True) 