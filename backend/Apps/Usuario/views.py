from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from .models import User, Role, CustomPermission
from ..Notificaciones.models import Notification
from ..Clientes.models import UserClientAssignment, Client
from django.utils import timezone
from .serializers import (UserSerializer,
                          LoginSerializer,
                          SimpleUserSerializer,
                          PasswordResetRequestSerializer,
                          PasswordResetSerializer,
                          RoleSerializer,
                          CustomPermissionSerializer,
                          UserRoleSerializer,
                          UserClientAssignmentSerializer)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    def get_queryset(self):
        # Excluir al usuario que hace la petición
        return User.objects.exclude(Q(rol__name="Cliente") | Q(rol__name="Cliente Aux")).order_by('name')

class SimpleUserListView(generics.ListAPIView):
    serializer_class = SimpleUserSerializer
    def get_queryset(self):
        # Excluir al usuario que hace la petición
        return User.objects.exclude(Q(rol__name="Cliente") | Q(rol__name="Cliente Aux")).order_by('name')

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        email = self.kwargs['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise generics.Http404
        # Verifica permisos: el usuario autenticado debe ser el mismo usuario o un staff
        """
        if user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Usted no tiene permisos para editar este perfil.")
        """
        return user

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    #permission_classes = [IsAdminUser]  # Solo un administrador puede eliminar usuarios

    def get_object(self):
        email = self.kwargs['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise generics.Http404
        # Verifica permisos: solo un staff puede eliminar
        #if not self.request.user.is_staff:
            #raise PermissionDenied("Usted no tiene permisos para eliminar este perfil.")

        return user

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data.copy()  # Hacer una copia
            
            email = validated_data.pop('email')
            password = validated_data.pop('password') 
            validated_data.pop('is_staff', None)
            validated_data.pop('is_superuser', None)
            validated_data.pop('groups', None)
            validated_data.pop('user_permissions', None)

            User.objects.create_superuser(
                email=email,
                password=password,
                **validated_data
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']  # El user validado viene del método validate_login
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        user_data = SimpleUserSerializer(user).data
        return Response({
            'refresh': str(refresh),
            'access': access,
            'user': user_data
        }, status=status.HTTP_200_OK)
    
class ChangePasswordView(APIView):
    def post(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get("currentPassword")
        new_password = request.data.get("newPassword")

        # Verificar que la contraseña actual coincida
        if not check_password(current_password, user.password):
            return Response({"detail": "La contraseña actual no es correcta."}, status=status.HTTP_400_BAD_REQUEST)
        # Verificar que la nueva contraseña cumpla con los requisitos mínimos
        if not new_password or len(new_password) < 8:
            return Response({"detail": "La nueva contraseña debe tener al menos 8 caracteres."}, status=status.HTTP_400_BAD_REQUEST)
        # Cambiar la contraseña del usuario
        user.set_password(new_password)
        user.save()
        Notification.objects.create(
                message=f"Haz cambiado tu contraseña",
                date=timezone.now().date(),
                type="info",
                user=user
            )
        return Response({"detail": "La contraseña ha sido cambiada exitosamente."}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = get_object_or_404(User, email=email)

            # Generar el token
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Construir el enlace de restablecimiento
            frontend_url = "https://okweb.one"
            reset_url = f"{frontend_url}/recuperar/{uid}/{token}/"
            from_email = settings.DEFAULT_FROM_EMAIL

            # Enviar el correo
            send_mail(
                'Recuperación de contraseña',
                f'Hola, {user.get_full_name()}.\n Has solicitado un restablecimiento de contraseña.\n'
                f'Entra en el siguiente enlace para restablecer tu contraseña:\n{reset_url}',
                from_email,
                [email],
                fail_silently=False,
            )

            return Response({"message": "Correo de recuperación enviado."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by("name")
    serializer_class = RoleSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        is_staff = self.request.query_params.get('is_staff')
        if is_staff is not None:
            is_staff = is_staff.lower() == 'true'
            queryset = queryset.filter(is_staff=is_staff)
        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Guarda los permisos base antes de actualizar
        additional_codes = [
            "view_role",
            "view_custompermission",
            "view_userclientassignment"
        ]
        additional_codes_staff = additional_codes + ["add_userclientassignment", "change_userclientassignment", "delete_userclientassignment"]
        
        if(request.data.get('is_staff')):
            base_codes = additional_codes_staff
        else:
            base_codes = additional_codes
        base_perms = CustomPermission.objects.filter(code__in=base_codes)

        response = super().update(request, *args, **kwargs)

        # Reasignar los permisos base
        instance.permissions.add(*base_perms)

        return response
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.name == "Super Admin":
            return Response(
                {"detail": "No se puede eliminar el rol 'Super Admin'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class CustomPermissionViewSet(viewsets.ModelViewSet):
    queryset = CustomPermission.objects.all()
    serializer_class = CustomPermissionSerializer

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRoleSerializer
    lookup_field = 'email'
    lookup_value_regex = '[^/]+'

class AssignedClientViewSet(viewsets.ModelViewSet):
    queryset = UserClientAssignment.objects.all()
    serializer_class = UserClientAssignmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user_email = self.request.query_params.get('user')

        if user_email:
            user_email = user_email.strip().rstrip('/')
            queryset = queryset.filter(user__email=user_email)

        return queryset
    
    def create(self, request, *args, **kwargs):
        user_email = request.data.get('user')
        client_ids = request.data.get('assigned_clients', [])

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        assignment, created = UserClientAssignment.objects.get_or_create(user=user)
        # Agrega los nuevos clientes sin borrar los anteriores
        for client_id in client_ids:
            assignment.assigned_clients.add(client_id)
        assignment.save()
        serializer = self.get_serializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='remove-client')
    def remove_client(self, request):
        user_email = request.data.get('user')
        client_id = request.data.get('client_id')
        if not user_email or not client_id:
            return Response({'error': 'user and client_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            assignment = UserClientAssignment.objects.get(user__email=user_email)
        except UserClientAssignment.DoesNotExist:
            return Response({'error': 'UserClientAssignment not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            client = assignment.assigned_clients.get(id=client_id)
        except:
            return Response({'error': 'Algo salio mal con el cliente'}, status=status.HTTP_404_NOT_FOUND)
        assignment.assigned_clients.remove(client)
        assignment.save()
        return Response({'message': f'Client {client_id} removed from user {user_email}'}, status=status.HTTP_200_OK)
    
class CollaboratorsForClientView(APIView):
    def get(self, request, client_id=None):
        if client_id:
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                return Response(
                    {'detail': f"No se encontró un cliente con id: {client_id}."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            user = request.user
            try:
                client = Client.objects.get(user=user)
            except Client.DoesNotExist:
                return Response(
                    {'detail': 'No se encontró un cliente asociado a este usuario.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Obtener asignaciones
        assignments = UserClientAssignment.objects.filter(assigned_clients=client)
        collaborators = [assignment.user for assignment in assignments]
        super_admins = User.objects.filter(rol__name="Super Admin")
        # Unir sin duplicados
        combined_users = list(set(collaborators + list(super_admins)))

        serializer = SimpleUserSerializer(combined_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)