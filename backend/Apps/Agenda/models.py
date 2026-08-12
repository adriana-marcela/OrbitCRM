from django.db import models
from ..Usuario.models import User

class Schedule(models.Model):
    time = models.TimeField()
    date = models.DateField()
    priority = models.CharField(max_length=15)
    title = models.CharField(max_length=100)
    subtext = models.TextField(blank=True,null=True)
    completed = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_schedules')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_schedules', null=True)

    class Meta:
        ordering = ['date', 'time']

