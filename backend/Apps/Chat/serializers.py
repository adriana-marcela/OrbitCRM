from rest_framework import serializers
from .models import Chat, Message

class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'date']
        read_only_fields = ['sender', 'date']

class ChatSerializer(serializers.ModelSerializer):
    person1 = serializers.StringRelatedField(read_only=True)
    person2 = serializers.StringRelatedField(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'person1', 'person2', 'messages']
