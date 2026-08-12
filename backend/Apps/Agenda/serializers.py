from rest_framework import serializers
from .models import Schedule
from ..Usuario.models import User
from ..Clientes.models import TributaryAdd, Client

class ScheduleSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"])
    corporate_name = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ['id', 'time', 'date', 'priority', 'title', 'subtext', 'completed', 'created_by', 'assigned_to', 'corporate_name']
        read_only_fields = ['created_by']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.created_by:
            user = User.objects.filter(email=instance.created_by).first()
            data['created_by_name'] = user.get_full_name()
        if instance.assigned_to:
            user = User.objects.filter(email=instance.assigned_to).first()
            data['assigned_to_name'] = user.get_full_name()
        return data
    
    def get_corporate_name(self, obj):
        cli = Client.objects.filter(user=obj.created_by).first()
        tributary = None
        if(cli):
            tributary = TributaryAdd.objects.filter(client=cli).first()
        return tributary.corporate_name if tributary else None