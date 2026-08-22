from django.db import models

SER_CATEGORY = [
    ('Ok Web','Ok Web'),
    ('Complemento','Complemento'),
    ('Constructor','Constructor'),
    ('Temas','Temas'),
]

class Services(models.Model):
    name = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    img = models.ImageField(upload_to="Services",blank=True,null=True)
    category = models.CharField(
        choices=SER_CATEGORY, 
        default='OK Web',
        max_length=12,
        verbose_name='Categoria del servicio'
    )
    url = models.CharField(blank=True, max_length=255)
    #interno
    updated_at = models.DateTimeField(auto_now=True) 
    def __str__(self):
        return f"{self.name}"