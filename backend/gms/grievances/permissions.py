from rest_framework import permissions

class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and (request.user.is_staff or request.user.is_superuser):
            return True
        
        # Allow reading public grievances
        if request.method in permissions.SAFE_METHODS and obj.is_public:
            return True
            
        return obj.created_by == request.user

class IsStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return request.user.is_staff or getattr(request.user, 'user_roles', None) and request.user.user_roles.filter(role__name__in=['staff', 'admin']).exists()
        return False
