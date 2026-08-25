from django.contrib.auth.models import AbstractUser
from django.db import models
from core.constants import UserRole
from core.validators import validate_iran_mobile


class User(AbstractUser):
    """
    Custom user model. `role` drives RBAC across the whole platform —
    every permission class in core.permissions checks this field.
    """
    role = models.CharField(max_length=10, choices=UserRole.CHOICES, default=UserRole.BUYER)
    mobile = models.CharField(max_length=11, validators=[validate_iran_mobile], unique=True)
    is_mobile_verified = models.BooleanField(default=False)
    national_id = models.CharField(max_length=10, blank=True, null=True)
    province = models.ForeignKey('locations.Province', null=True, blank=True, on_delete=models.SET_NULL)
    city = models.ForeignKey('locations.City', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.role})"
