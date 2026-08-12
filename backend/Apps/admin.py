from django.contrib import admin

from Apps.Accesos.models import Access
from Apps.Agenda.models import Schedule
from Apps.Clientes.models import Client
from Apps.Servicios.models import Services
from Apps.Usuario.models import User

admin.site.register(Access)
admin.site.register(Schedule)
admin.site.register(Client)
admin.site.register(Services)
admin.site.register(User)



