from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework import generics
from .models import Client, ClientService, TributaryAdd
from ..HistorialPagos.models import PaymentHistory
from .serializers import ClientSerializer, ClientServiceSerializer, SimpleClientSerializer, TributarySerializer
from rest_framework.generics import ListAPIView
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
#from ..Usuario.permissions import  HasActionPermission
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from collections import defaultdict
from rest_framework.decorators import action

# Cliente simplificado
class SimpleClientView(ListAPIView):
    serializer_class = SimpleClientSerializer
    def get_queryset(self):
        # Si el usuario es un cliente, solo puede ver su propio perfil
        role = self.request.user.rol
        if role and role.is_staff == False:
            return Client.objects.filter(email=self.request.user.email)
        # Si no es un cliente, devuelve todos los clientes
        return Client.objects.all().order_by('name')
# Listar y crear clientes
class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    def get_queryset(self):
        # Si el usuario es un cliente, solo puede ver su propio perfil
        role = self.request.user.rol
        if role and role.is_staff == False:
            return Client.objects.filter(email=self.request.user.email)
        # Si no es un cliente, devuelve todos los clientes
        return Client.objects.all().order_by('-updated_at')
    def perform_create(self, serializer):
        client = serializer.save()

# Obtener, actualizar y eliminar un cliente específico
class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientSerializer
    def get_queryset(self):
        # Si el usuario es un cliente, solo puede ver su propio perfil
        role = self.request.user.rol
        if role and role.is_staff == False:
            return Client.objects.filter(email=self.request.user.email)
        # Si no es un cliente, devuelve todos los clientes
        return Client.objects.all()
    
    def perform_update(self, serializer):
        # Si el usuario es un cliente, solo puede actualizar su propio perfil
        role = self.request.user.rol
        if role and role.is_staff == False:
            if serializer.instance.email != self.request.user.email:
                raise PermissionDenied("No puedes actualizar otro cliente")
            serializer.save()
        else:
            serializer.save()

    def perform_destroy(self, instance):
        # Si el usuario es un cliente, no puede hacer nada
        role = self.request.user.rol
        if role and role.is_staff == False:
            raise PermissionDenied("No tienes permisos para eliminar")
        else:
            instance.delete()
# Crud servicios de un cliente
class ClientServiceViewSet(viewsets.ViewSet):

    def create(self, request, client_id=None):
        data = request.data
        data["client"] = client_id
        cantidad = int(data.get("Nrecurrency", 1))  # Cantidad de servicios a crear
        recurrence = data.get("recurrence", "Mensual")  # Recurrencia (Mensual o Anual)

        try:
            # Validamos la existencia del cliente
            Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({'error': 'Cliente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Validamos el serializer una sola vez para la estructura base
        serializer = ClientServiceSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Definimos el delta en función de la recurrencia
        if recurrence == "Mensual":
            delta = relativedelta(months=1)
        elif recurrence == "Anual":
            delta = relativedelta(years=1)
        else:
            return Response({'error': 'Periodo no válida.'}, status=status.HTTP_400_BAD_REQUEST)

        created_services = []  # Lista para almacenar los servicios creados

        # Obtenemos las fechas iniciales del primer servicio
        current_start_date = serializer.validated_data["startDate"]
        current_expiration_date = serializer.validated_data["startDate"] + delta - timedelta(days=1)

        for i in range(cantidad):
            # Actualizamos las fechas dinámicamente
            data["startDate"] = current_start_date
            data["expirationDate"] = current_expiration_date

            # Serializamos y guardamos el nuevo ClientService
            service_serializer = ClientServiceSerializer(data=data)
            if service_serializer.is_valid():
                client_service = service_serializer.save()
                created_services.append(client_service)

                # Creamos el registro de PaymentHistory
                PaymentHistory.objects.create(
                    date=now().date(),
                    service=client_service.service,
                    client=client_service.client,
                    clientService=client_service,
                    currency= client_service.currency,
                    price=client_service.price,
                    is_payed=client_service.is_payed,
                )

                # Actualizamos las fechas para el próximo servicio
                current_start_date += delta
                current_expiration_date += delta
            else:
                return Response(service_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Serializamos todos los servicios creados para la respuesta
        serialized_services = ClientServiceSerializer(created_services, many=True)
        return Response(serialized_services.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, client_id=None, pk=None):
        try:
            history = PaymentHistory.objects.filter(clientService=pk).first()
            client_service = ClientService.objects.get(id=pk, client_id=client_id)

            if(history and not client_service.is_payed):
                history.delete()

            client_service.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ClientService.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    def list(self, request, client_id=None):
        # Filtrar registros donde la categoría del servicio no sea "Ok Web"
        services_not_ok_web = ClientService.objects.filter(
            client_id=client_id
        ).exclude(service__category="Ok Web").order_by('-updated_at')
        
        # Filtrar registros donde la categoría del servicio sea "Ok Web"
        services_ok_web = ClientService.objects.filter(
            client_id=client_id,
            service__category="Ok Web"
        ).order_by('-updated_at')

        # Serializar ambas listas
        serializer_not_ok_web = ClientServiceSerializer(services_not_ok_web, many=True)
        serializer_ok_web = ClientServiceSerializer(services_ok_web, many=True)

        # Retornar las listas separadas en la respuesta
        return Response({
            'wordpress': serializer_not_ok_web.data,
            'servicios': serializer_ok_web.data
        })

    def update(self, request, client_id=None, pk=None):
        data = request.data
        try:
            # Obtenemos el `ClientService` que se va a actualizar
            client_service = ClientService.objects.get(id=pk, client_id=client_id)

            # Calculamos el nuevo `expirationDate` basado en el `startDate`
            recurrence = data.get("recurrence", client_service.recurrence)
            start_date = data.get("startDate", client_service.startDate)  # Obtenemos startDate del request o del objeto
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, "%d/%m/%Y").date()

            # Definimos el delta en función de la recurrencia
            if recurrence == "Mensual":
                delta = relativedelta(months=1)
            elif recurrence == "Anual":
                delta = relativedelta(years=1)
            else:
                return Response({'error': 'Recurrencia no válida.'}, status=status.HTTP_400_BAD_REQUEST)

            expiration_date = start_date + delta
            data["expirationDate"] = expiration_date

            # Actualizamos el `ClientService` con el serializer
            serializer = ClientServiceSerializer(client_service, data=data, partial=True)
            if serializer.is_valid():
                # Verificar si hay cambios en `is_payed`
                is_payed_original = client_service.is_payed
                is_payed_nuevo = data.get("is_payed", is_payed_original)

                # Guardamos los cambios en el `ClientService`
                updated_client_service = serializer.save()

                # Actualizamos `PaymentHistory` si `is_payed` cambió
                if is_payed_original != is_payed_nuevo:
                    try:
                        payment_history = PaymentHistory.objects.get(clientService=updated_client_service)
                        payment_history.is_payed = is_payed_nuevo
                        payment_history.date = now().date()
                        payment_history.currency = data.get("currency")
                        payment_history.save()
                    except PaymentHistory.DoesNotExist:
                        return Response({'error': 'Historial de pagos no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except ClientService.DoesNotExist:
            return Response({'error': 'Servicio de cliente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)       
# tributarias adicionales
class TributaryViewSet(viewsets.ViewSet):
    def list(self, request, client_id=None):
        tributaries = TributaryAdd.objects.filter(client_id=client_id)
        serializer = TributarySerializer(tributaries, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        tributary = get_object_or_404(TributaryAdd, pk=pk)
        tributary.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='all')
    def all(self, request, client_id=None):
        # Paso 1: recolectar todos los tributarios (nombres como tributaries[0][campo])
        tributaries_dict = defaultdict(dict)

        # Combinar datos de texto y archivos
        all_data = list(request.POST.items()) + list(request.FILES.items())

        for key, value in all_data:
            if key.startswith("tributaries["):
                # Extrae el índice y campo: tributaries[0][corporate_name] -> 0, corporate_name
                import re
                match = re.match(r"tributaries\[(\d+)\]\[(\w+)\]", key)
                if match:
                    idx, field = match.groups()
                    tributaries_dict[int(idx)][field] = value

        updated_items = []

        for tributary_data in tributaries_dict.values():
            tributary_id = tributary_data.get("id")
            tributary_data["client"] = client_id  # Relacionar con cliente

            if tributary_id:
                try:
                    tributary = TributaryAdd.objects.get(id=tributary_id, client_id=client_id)
                    serializer = TributarySerializer(tributary, data=tributary_data, partial=True)
                except TributaryAdd.DoesNotExist:
                    serializer = TributarySerializer(data=tributary_data)  # Si no existe, créalo
            else:
                serializer = TributarySerializer(data=tributary_data)

            if serializer.is_valid():
                serializer.save()
                updated_items.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(updated_items, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='delete_file')
    def delete_file(self, request):
        tributary_id = request.data.get("id")
        field = request.data.get("field")

        if field not in ["rut", "c_commerce"]:
            return Response({"error": "Campo no válido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tributary = TributaryAdd.objects.get(id=tributary_id)
        except TributaryAdd.DoesNotExist:
            return Response({"error": "Tributario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        file_field = getattr(tributary, field, None)

        if file_field and file_field.name:
            file_field.delete(save=True)
            return Response({"success": f"{field} eliminado correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Archivo no existe"}, status=status.HTTP_400_BAD_REQUEST)