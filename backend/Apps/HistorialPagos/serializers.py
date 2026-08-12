from rest_framework import serializers
from .models import PaymentHistory

class HistorySerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"])
    clientName = serializers.SerializerMethodField()
    collaboratorName = serializers.SerializerMethodField()
    serviceName = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = PaymentHistory
        fields = ['id','date', 'service', 'client', 'collaborator', 'currency','price', 'is_payed', 'clientName', 'collaboratorName', 'serviceName']

    def get_clientName(self, obj):
        client = obj.client
        # Concatenando name y lastname de Client
        return f"{client.name} {client.lastname}" if client else None
    
    def get_collaboratorName(self, obj):
        client = obj.client
        # Concatenando name y lastname de Client
        return f"{client.name} {client.lastname}" if client else None