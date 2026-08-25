from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsProductOwnerOrReadOnly(BasePermission):
    """Buyers/anonymous users can only read; only the owning seller (or admin) can edit."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and (obj.seller == user or user.role == 'ADMIN')
