from django.db import models
from ..Usuario.models import User

class Chat(models.Model):
    person1 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='chats_as_person1'
    )
    person2 = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='chats_as_person2'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['person1', 'person2'], 
                name='unique_chat_between_two_users'
            ),
            models.CheckConstraint(
                check=~models.Q(person1=models.F('person2')), 
                name='prevent_same_user_chat'
            )
        ]

    def __str__(self):
        return f"Chat between {self.person1} and {self.person2}"

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(User,on_delete=models.CASCADE, related_name='remitente')
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.chat} at {self.date}"