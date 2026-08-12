from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScheduleViewSet


router = DefaultRouter()
router.register(r'agenda', ScheduleViewSet, basename="agenda")

# Incluir las URLs del router
urlpatterns = [
    path('', include(router.urls)),
]
