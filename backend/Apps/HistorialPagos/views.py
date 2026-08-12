from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PaymentHistory
from .serializers import HistorySerializer

class PaymentHistoryViewSet(mixins.ListModelMixin,mixins.RetrieveModelMixin,
                            mixins.DestroyModelMixin, viewsets.GenericViewSet): 

    queryset = PaymentHistory.objects.all()
    serializer_class = HistorySerializer

    @action(detail=False, methods=['get'], url_path='clients')
    def by_clients(self, request):
        payments = PaymentHistory.objects.filter(collaborator=None)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='collaborators')
    def by_collaborators(self, request):
        payments = PaymentHistory.objects.filter(client=None)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        role = request.user.rol.name
        if role != "Super Admin":
            return Response(
                {"detail": "Usted no cuenta con los permisos para hacer esta accion"},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


