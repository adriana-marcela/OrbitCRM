from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Schedule
from ..Usuario.models import User
from ..Clientes.models import Client, UserClientAssignment, TributaryAdd
from .serializers import ScheduleSerializer
from django.core.exceptions import ValidationError
from django.db.models import Q
from ..Notificaciones.models import Notification
from django.utils import timezone

class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        rol = User.objects.filter(email=self.request.user).first().rol.name
        if(rol == "Super Admin" or rol == "Admin"):
            return Schedule.objects.all()
        return Schedule.objects.filter(
            Q(created_by=self.request.user) | Q(assigned_to=self.request.user)
        )

    def perform_create(self, serializer):
        assigned_email = serializer.initial_data.get('assigned_to')
        assigned_client_id = serializer.initial_data.get('assigned_client')
        creador = self.request.user

        if assigned_client_id and assigned_client_id != "":
            assigned_client = Client.objects.filter(id=assigned_client_id).first()
            if not assigned_client:
                raise ValidationError("El cliente asignado no es válido.")
            creador = assigned_client.user
            corporate_name = TributaryAdd.objects.filter(client=assigned_client).values_list('corporate_name', flat=True).first() or 'Ok Web'

        else:
            assigned_client = None
            creador = User.objects.filter(email=self.request.user).first()

        if assigned_email and assigned_email != "":
            assigned_user = User.objects.filter(email=assigned_email).first()
            if not assigned_user:
                raise ValidationError("El usuario asignado no es válido.")
            Notification.objects.create(
                message=f"Hola, {assigned_user.get_full_name()} tienes una nueva tarea asignada por {creador.get_full_name()} de {corporate_name}.\nPara realizar la tarea puedes ingresar a okweb.one.",
                date=timezone.now().date(),
                type="info",
                user=assigned_user
            )
        else:
            assigned_user = self.request.user
        if assigned_client and assigned_user:
            # Buscar si ya existe una asignación para ese usuario
            assignment, created = UserClientAssignment.objects.get_or_create(user=assigned_user)
            # Agregar el cliente si no está ya asignado
            if assigned_client not in assignment.assigned_clients.all():
                assignment.assigned_clients.add(assigned_client)
        serializer.save(
            created_by=creador,
            assigned_to=assigned_user
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        rol = User.objects.filter(email=self.request.user).first().rol.name
        # Solo el creador puede eliminar
        if instance.created_by != request.user and rol != "Super Admin" and rol != "Admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        rol = User.objects.filter(email=self.request.user).first().rol.name
        # Solo el creador puede actualizar
        if instance.created_by != request.user and instance.assigned_to != request.user and rol != "Super Admin" and rol != "Admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

