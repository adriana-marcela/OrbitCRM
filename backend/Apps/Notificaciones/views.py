from rest_framework import generics
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

class TenPerPagePagination(PageNumberPagination):
    page_size = 10

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    pagination_class = TenPerPagePagination
    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            type='event'
        ).order_by('-updated_at') | Notification.objects.filter(
            type='info',
            user=user
        ).order_by('-updated_at')


class NotificationDeleteView(generics.DestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.type == 'info' and instance.user == request.user:
            return super().delete(request, *args, **kwargs)
        else:
            return Response({'detail': 'No autorizado para borrar esta notificación.'},
                            status=status.HTTP_403_FORBIDDEN)
