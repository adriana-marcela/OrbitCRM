from django.db import models
from ..Servicios.models import Services
from django.utils import timezone
from datetime import timedelta
from ..Usuario.models import User
from django.core.exceptions import ValidationError
IDENTIFICACION_OPCIONES = [
    ('CC', 'Cédula de ciudadanía'),
    ('NIT', 'NIT'),
    ('P', 'Pasaporte'),
    ('CE', 'Cédula de extranjería'),
    ('TI', 'Tarjeta de identidad'),
    ('RC', 'Registro civil'),
    ('NIUP', 'NIUP'),
]
REGIMEN_OPCIONES = [
    ('N/A', 'No aplica'),
    ('IVA', 'Responsable de IVA'),
    ('No IVA', 'Responsable de NO IVA')
]
CONTRIBUYENTE_OPCIONES = [
    ('N/A', 'No aplica'),
    ('Juridico', 'Persona juridica'),
    ('Natural', 'Persona natural')
]
TAX_OPCIONES = [
    ('IVA', 'IVA impuesto sobre las ventas'),
    ('INC', 'INC impuesto nacional al consumo'),
    ('IVA-INC', 'IVA - INC'),
    ('N/A', 'No aplica')
]
TAX_ID_OPCIONES = [
    ('01','Gran contribuyente'),
    ('02','Autorretenedor'),
    ('03','Agente de retencion en el impuesto sobre las ventas'),
    ('04','Regimen simple de tributacion'),
    ('05','R-99-PN'),
    ('06','No aplica'),
    ('07','Otros')
]
RECURRENCE_OPCIONES = [
    ('Mensual', 'Mensual'),
    ('Anual', 'Anual')
]

class Client(models.Model):
    name = models.CharField(max_length=30, blank=True)
    lastname = models.CharField(max_length=30, blank=True)
    description = models.TextField(blank=True)
    documentType = models.CharField(
        choices=IDENTIFICACION_OPCIONES, 
        default='CC',
        max_length=5,
        verbose_name='Tipo de Identificación'
    )
    # Informacion basica
    documentNumber = models.CharField(max_length=15, blank=False)
    email = models.EmailField()
    country = models.CharField(max_length=30, blank=True)
    department = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=80, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    photo = models.ImageField(upload_to="Profile/Clients",blank=True,null=True)
    birthday = models.DateField(null=True, blank=True)
    # Credenciales
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    _pending_role = None
    # interno
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.user:
            self.user = create_default_user(self)  # Asigna el usuario antes de guardar
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Guarda el usuario antes de eliminar el cliente
        user_to_delete = self.user
        super().delete(*args, **kwargs)
        if user_to_delete:
            user_to_delete.delete()
def default_expiration_date():
    return timezone.now() + timedelta(days=30)

def create_default_user(client):
    if not client.email or not client.documentNumber:
        raise ValidationError("El cliente debe tener un email y un documentNumber para crear el usuario.")
    # Verificar si ya existe un usuario con el mismo email
    if User.objects.filter(email=client.email).exists():
        raise ValidationError("El email ya está en uso.")
    # Crear y devolver el usuario
    role = client._pending_role or 1
    return User.objects.create_user(email=client.email, password=client.documentNumber, rol_id=role, name=client.name, lastname=client.lastname)

class UserClientAssignment(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    assigned_clients = models.ManyToManyField(Client, blank=True)

class ClientService(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    service = models.ForeignKey(Services, on_delete=models.CASCADE)
    startDate = models.DateField(default=timezone.now) 
    expirationDate = models.DateField(default=default_expiration_date)
    currency = models.CharField(max_length=7, default="COP")
    price = models.IntegerField(default=0)
    is_recurrent = models.BooleanField(default=False)
    recurrence = models.CharField(
        choices=RECURRENCE_OPCIONES, 
        default='Mensual',
        max_length=8,
        verbose_name='Recurrencia'
    )
    is_payed = models.BooleanField(default=False)
    #interno
    updated_at = models.DateTimeField(auto_now=True) 

class TributaryAdd(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    corporate_name = models.CharField(max_length=100, blank=True) 
    company_name = models.CharField(max_length=100, blank=True)
    tributary_id = models.CharField(max_length=30, blank=True)
    tributary_number = models.CharField(max_length=30, blank=True)
    taxpayer_type = models.CharField(
        choices=CONTRIBUYENTE_OPCIONES, 
        default='Natural',
        max_length=10,
        verbose_name='Tipo de contribuyente'
    )
    tax_liability = models.CharField(
        choices=TAX_OPCIONES, 
        default='IVA',
        max_length=8,
        verbose_name='Responsabilidad tributaria'
    )
    tax_id_type = models.CharField(
        choices=TAX_ID_OPCIONES, 
        default='01',
        max_length=55,
        verbose_name='Tipo de identificacion tributaria 2'
    )
    regime_type = models.CharField(
        choices=REGIMEN_OPCIONES, 
        default='IVA',
        max_length=7,
        verbose_name='Tipo de regimen'
    )
    rut = models.FileField(upload_to="Documents/RUT", blank=True, null=True)
    c_commerce = models.FileField(upload_to="Documents/C_Commercial", blank=True, null=True)

    def delete(self, *args, **kwargs):
        # Elimina archivos si existen
        if self.rut:
            self.rut.delete(save=False)
        if self.c_commerce:
            self.c_commerce.delete(save=False)
        
        # Luego elimina el objeto del modelo
        super().delete(*args, **kwargs)