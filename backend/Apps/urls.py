from django.urls import path,  include

urlpatterns = [
    path('users/', include('Apps.Usuario.urls')),
    path('clients/', include('Apps.Clientes.urls')),
    path('chat/', include('Apps.Chat.urls')),
    path('', include('Apps.Agenda.urls')), #agenda
    path('', include('Apps.Servicios.urls')), #services
    path('', include('Apps.HistorialPagos.urls')), # Historial de pagos
    path('notifications/', include('Apps.Notificaciones.urls')),
]
