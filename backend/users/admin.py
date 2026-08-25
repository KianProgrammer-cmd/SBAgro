from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "mobile",
        "role",
        "is_mobile_verified",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "role",
        "is_mobile_verified",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "username",
        "email",
        "mobile",
        "national_id",
    )

    fieldsets = (
        (None, {
            "fields": ("username", "password")
        }),
        ("اطلاعات شخصی", {
            "fields": (
                "first_name",
                "last_name",
                "email",
                "mobile",
                "national_id",
                "province",
                "city",
            )
        }),
        ("نقش و وضعیت", {
            "fields": (
                "role",
                "is_mobile_verified",
            )
        }),
        ("دسترسی‌ها", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        ("تاریخ‌ها", {
            "fields": (
                "last_login",
                "date_joined",
                "created_at",
                "updated_at",
            )
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username",
                "password1",
                "password2",
                "mobile",
                "email",
                "role",
                "first_name",
                "last_name",
                "national_id",
                "province",
                "city",
                "is_mobile_verified",
                "is_staff",
                "is_active",
            ),
        }),
    )

    readonly_fields = (
        "last_login",
        "date_joined",
        "created_at",
        "updated_at",
    )