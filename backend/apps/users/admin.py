from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "username", "email", "is_admin", "is_active")
    list_filter = ("is_admin", "is_active", "is_staff")
    search_fields = ("username", "email")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Дополнительно", {"fields": ("is_admin",)}),
    )