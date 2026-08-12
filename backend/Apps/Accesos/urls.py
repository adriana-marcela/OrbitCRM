from django.urls import path
from .views import AccessListCreateView, AccessDetailView

urlpatterns = [
    path('', AccessListCreateView.as_view(), name='access-list-create'),
    path('<int:pk>/', AccessDetailView.as_view(), name='access-detail'),
]
