from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager

IDENTIFICACION_OPCIONES = [
    ('CC', 'Cédula de ciudadanía'),
    ('TI', 'tarjeta de identidad'),
    ('CE', 'Cédula de extranjería'),
    ('P', 'Pasaporte'),
]

class CustomPermission(models.Model):
    code = models.CharField(max_length=100, unique=True)
    model = models.CharField(max_length=30, blank=True)
    
    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    permissions = models.ManyToManyField(CustomPermission, blank=True)
    is_staff = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class User(AbstractBaseUser, PermissionsMixin):
    
    email = models.EmailField(primary_key=True)
    # Informacion general
    name = models.CharField(max_length=30, blank=True)
    lastname = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    photo = models.ImageField(upload_to="Profile/Users", blank=True, null=True)
    eEmail_personal = models.EmailField(max_length=40, blank=True)
    eEmail_laboral = models.EmailField(max_length=40, blank=True)
    birthday = models.DateField(null=True, blank=True)
    documentType = models.CharField(
        choices=IDENTIFICACION_OPCIONES, 
        default='CC',
        max_length=3,
        verbose_name='Tipo de documento'
    )
    documentNumber = models.CharField(max_length=15, blank=True)
    country = models.CharField(max_length=47, blank=True)
    department = models.CharField(max_length=40, blank=True)
    city = models.CharField(max_length=40, blank=True)
    address = models.CharField(max_length=50, blank=True)
    # campos de Cv
    description = models.TextField(blank=True,null=True)
    language = models.CharField(max_length=40, blank=True)
    formation = models.CharField(max_length=50, blank=True)
    knowledge = models.CharField(max_length=50, blank=True)
    skill = models.CharField(max_length=50, blank=True)
    # Bancaria
    bank = models.CharField(max_length=50, blank=True)
    accountNumber = models.CharField(max_length=50, blank=True)
    accountType = models.CharField(max_length=50, blank=True)
    holderBank = models.CharField(max_length=50, blank=True)
    #interno
    updated_at = models.DateTimeField(auto_now=True) 
    USERNAME_FIELD = 'email'
    is_staff = models.BooleanField(default=False)
    rol = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    objects = UserManager()

    def get_full_name(self):
        return self.name +" "+ self.lastname
    
