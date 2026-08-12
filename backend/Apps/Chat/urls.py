from django.urls import path
from .views import ChatView, MessageView, Contacts

urlpatterns = [
    path('', ChatView.as_view(), name='chat'),
    path('<str:recipient>/', MessageView.as_view(), name='menssages'),
    path('contacts', Contacts.as_view(), name='contacts'), #no lleva slash final
]
#