from django.urls import path, include
from .views import ServicesViewSet, ServicesFiltered
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'services', ServicesViewSet, basename="services")

urlpatterns = [
    path('services/filtered/', ServicesFiltered.as_view({'get': 'list'}), name='filtered-services'),
    path('', include(router.urls)),
]
