from .models import User, CustomPermission, Role
from ..Clientes.models import Client, UserClientAssignment
from ..Clientes.serializers import SimpleClientSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    birthday = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"], required=False,  allow_null=True)
    assigned_clients = serializers.SerializerMethodField(required=False)

    class Meta:
        model = User
        fields = '__all__'
    
    def get_assigned_clients(self, obj):
        assignment = UserClientAssignment.objects.filter(user=obj).first()
        if assignment:
            return SimpleClientSerializer(assignment.assigned_clients.all(), many=True).data
        return []

class UserClientAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserClientAssignment
        fields = '__all__'

class SimpleUserSerializer(serializers.ModelSerializer):
    fullname = serializers.SerializerMethodField()
    rol = serializers.SlugRelatedField(read_only=True, slug_field='name')
    is_staff = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['email', 'fullname', 'rol', 'photo', 'is_staff']

    def get_fullname(self, obj):
        return f"{obj.name} {obj.lastname}"
    
    def get_is_staff(self, obj):
        return obj.rol.is_staff if obj.rol else None
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Invalid credentials")
   
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No hay ningún usuario con este correo electrónico.")
        return value

class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if 'new_password' not in data:
            raise serializers.ValidationError("Se requiere una nueva contraseña.")
        return data
    
class CustomPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomPermission
        fields = ['id', 'code', 'model']

class RoleSerializer(serializers.ModelSerializer):
    permissions = CustomPermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomPermission.objects.all(), write_only=True, source='permissions', required=False
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'is_staff', 'permissions', 'permission_ids']

class UserRoleSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    rol = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), write_only=True, source='rol')

    class Meta:
        model = User
        fields = ['email', 'rol', 'role_id']