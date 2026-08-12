from django.urls import path, include
from .views import (
    LoginView,
    UserDetailView,
    ChangePasswordView,
    UserListView,
    UserDeleteView,
    CreateUserView,
    SimpleUserListView,
    PasswordResetRequestView,
    PasswordResetView,
    RoleViewSet,
    CustomPermissionViewSet,
    UserRoleViewSet,
    AssignedClientViewSet,
    CollaboratorsForClientView
)
from rest_framework.routers import DefaultRouter
app_name = 'usuario'

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'permissions', CustomPermissionViewSet)
router.register(r'user-rol', UserRoleViewSet)
router.register(r'assign', AssignedClientViewSet)

urlpatterns = [
    path("change-password/", ChangePasswordView.as_view(), name='change-password'),# Cambiar la contraseña del usuario logueado
    path("simple/", SimpleUserListView.as_view(), name='simple-user-list'), # Traer todos los usuarios con info minima
    path("simple-cfc/", CollaboratorsForClientView.as_view(), name='collab-for-client'),
    path("simple-cfc/<int:client_id>/", CollaboratorsForClientView.as_view(), name='collab-for-client-by-id'),
    path('<str:email>/delete/', UserDeleteView.as_view(), name='user-delete'),
    path('colaborator/', CreateUserView.as_view(), name='create-superuser'),
    path("login/", LoginView.as_view(), name="login"), # Loguearse
    path("password-reset-request/", PasswordResetRequestView.as_view(), name='password-reset-request'),
    path("reset-password/", PasswordResetView.as_view(), name='password-reset'),
    path("<str:email>/", UserDetailView.as_view(), name ="user-detail"), #traer/modificar un usuario segun su correo electronico
    #administracion
    path("admin/", include(router.urls)),
    #base
    path("", UserListView.as_view(), name='user-list') # Traer todos los usuarios
]