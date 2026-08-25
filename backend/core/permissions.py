"""
Role-based access control (RBAC) permission classes.
Every role-restricted endpoint in SBAgro must use one of these classes
(or compose new ones from BaseRolePermission) rather than checking
request.user.role manually in views.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class BaseRolePermission(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role in self.allowed_roles
        )


class IsSeller(BaseRolePermission):
    allowed_roles = ('SELLER',)


class IsBuyer(BaseRolePermission):
    allowed_roles = ('BUYER',)


class IsAdmin(BaseRolePermission):
    allowed_roles = ('ADMIN',)


class IsSellerOrAdmin(BaseRolePermission):
    allowed_roles = ('SELLER', 'ADMIN')


class IsBuyerOrAdmin(BaseRolePermission):
    allowed_roles = ('BUYER', 'ADMIN')


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: only the object's owner (obj.user / obj.seller / obj.buyer)
    or an admin may access or modify it. Read-only access for safe methods can still
    be restricted further at the view level if needed.
    """
    owner_field = 'user'

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_authenticated and user.role == 'ADMIN':
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner == user


class ReadOnlyOrIsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return getattr(obj, 'user', None) == request.user
