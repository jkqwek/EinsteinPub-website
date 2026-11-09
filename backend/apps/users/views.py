from rest_framework.permissions import BasePermission, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView


def can_hire(user):
    """Вакансии и отклики — только администраторам: суперпользователь
    или сотрудник с флажком «Администратор»."""
    return bool(
        user
        and user.is_authenticated
        and user.is_staff
        and (user.is_superuser or user.is_admin)
    )


class IsHiringAdmin(BasePermission):
    def has_permission(self, request, view):
        return can_hire(request.user)


class MeView(APIView):
    """Кто вошёл в админ-панель: по can_hire она прячет вакансии и отклики."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(
            {"username": request.user.username, "can_hire": can_hire(request.user)}
        )
