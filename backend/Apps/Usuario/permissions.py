from rest_framework.permissions import BasePermission

class CanViewOwnClientProfile(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('ver_cliente_propio')

class HasActionPermission(BasePermission):
    def has_permission(self, request, view):
        action_map = {
            'GET': 'view',
            'POST': 'add',
            'PUT': 'change',
            'PATCH': 'change',
            'DELETE': 'delete',
        }

        action_prefix = action_map.get(request.method)
        if not action_prefix:
            return False

        # Detectar modelo automáticamente
        model = getattr(getattr(view, 'queryset', None), 'model', None)
        if not model:
            serializer_class = getattr(view, 'serializer_class', None)
            if serializer_class and hasattr(serializer_class.Meta, 'model'):
                model = serializer_class.Meta.model
            else:
                return True

        model_name = model.__name__.lower()

        excluded_models = ['chat', 'message', 'schedule', 'access', 'notification']
        if model_name in excluded_models:
            return True  # Permitir acceso a estos modelos sin necesidad de verificación de permisos

        required_permission = f"{action_prefix}_{model_name}"

        role = request.user.rol
        if not role:
            return False
        
        role_permissions = set(role.permissions.values_list('code', flat=True))
        return required_permission in role_permissions