from django.urls import path,  include
from rest_framework.routers import DefaultRouter
from .views import PaymentHistoryViewSet

router = DefaultRouter()
router.register(r'payment-history', PaymentHistoryViewSet)
# Hacer las peticiones crud normal a payment-history y filtrado por cliente a payment-history/clients
urlpatterns = [
    path('', include(router.urls)),
]
