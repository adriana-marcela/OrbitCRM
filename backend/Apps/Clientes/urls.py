from django.urls import path, include
from .views import ClientListCreateView, ClientDetailView, ClientServiceViewSet, SimpleClientView, TributaryViewSet

urlpatterns = [
    path('<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    #Accesos
    path('<int:client_id>/Access/', include('Apps.Accesos.urls')),
    # Servicios del cliente
    path('<int:client_id>/clientservices/', 
        ClientServiceViewSet.as_view({'post': 'create', 'get': 'list'}), 
         name='clientservice-list-create'),
    path('<int:client_id>/clientservices/<int:pk>/', 
        ClientServiceViewSet.as_view({'delete': 'destroy', 'put': 'update'}), 
         name='clientservice-detail-update'),
    # Informacion tributaria adicional
    path('<int:client_id>/tributary/', 
        TributaryViewSet.as_view({'get': 'list'}), name='tributarys-list'),
    path('<int:client_id>/tributary/all/', 
        TributaryViewSet.as_view({'post': 'all'}), name='tributary-all'),
    path('<int:client_id>/tributary/<int:pk>/', 
        TributaryViewSet.as_view({'delete': 'destroy'}), name='tributary-delete'),
    path("tributary/delete_file/", TributaryViewSet.as_view({'post': 'delete_file'}), name="delete_file"),
    #Principal
    path('simple/', SimpleClientView.as_view(), name='simple-client-list'),#clientes simplificados
    path('', ClientListCreateView.as_view(), name='client-list-create')
]
