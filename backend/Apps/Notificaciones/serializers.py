from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"])
    class Meta:
        model = Notification
        fields = '__all__'
