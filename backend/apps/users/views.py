from rest_framework.permissions import BasePermission, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView


def is_super_admin(user):
    """Полный доступ: суперпользователь или сотрудник с флажком «Администратор»."""
    return bool(
        user
        and user.is_authenticated
        and user.is_staff
        and (user.is_superuser or getattr(user, 'is_admin', False))
    )


def can_hire(user):
    """Для обратной совместимости (вакансии и отклики)."""
    return is_super_admin(user)


class IsSuperAdmin(BasePermission):
    """Даёт доступ только супер-админам (для меню и галереи)."""
    def has_permission(self, request, view):
        return is_super_admin(request.user)


class IsHiringAdmin(BasePermission):
    """Даёт доступ к вакансиям и откликам."""
    def has_permission(self, request, view):
        return can_hire(request.user)


class MeView(APIView):
    """Кто вошёл в админ-панель: отдаём флаги для скрытия пунктов меню."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "can_hire": can_hire(request.user),
            "is_admin": is_super_admin(request.user),
        })