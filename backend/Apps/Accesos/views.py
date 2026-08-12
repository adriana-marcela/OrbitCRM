from rest_framework import generics
from .models import Access
from .serializers import AccessSerializer
from django.shortcuts import get_object_or_404
from ..Clientes.models import Client

# Listar y crear accesos
class AccessListCreateView(generics.ListCreateAPIView):
    serializer_class = AccessSerializer
    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return Access.objects.filter(client__id=client_id).order_by('-updated_at')

    def perform_create(self, serializer):
        client_id = self.kwargs['client_id']
        client = get_object_or_404(Client, id=client_id)
        serializer.save(client=client)

# Obtener, actualizar y eliminar un acceso específico
class AccessDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Access.objects.all()
    serializer_class = AccessSerializer

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return Access.objects.filter(client__id=client_id)