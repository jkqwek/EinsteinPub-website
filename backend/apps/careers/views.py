from pathlib import Path

from django.http import FileResponse, Http404
from rest_framework import generics
from rest_framework.throttling import ScopedRateThrottle

from apps.users.views import IsHiringAdmin
from .models import Application, Vacancy
from .serializers import (
    ApplicationAdminSerializer,
    ApplicationSerializer,
    VacancyAdminSerializer,
    VacancySerializer,
)

# Публичные вьюхи

class VacancyListView(generics.ListAPIView):
    queryset = Vacancy.objects.filter(is_open=True)
    serializer_class = VacancySerializer


class ApplicationCreateView(generics.CreateAPIView):
    """Отклик с сайта. Не больше 3 откликов в час с одного IP."""

    serializer_class = ApplicationSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "applications"


# Админские вьюхи: только администраторы (IsHiringAdmin), остальной персонал сюда не пускают

class VacancyAdminListCreateView(generics.ListCreateAPIView):
    queryset = Vacancy.objects.all()
    serializer_class = VacancyAdminSerializer
    permission_classes = [IsHiringAdmin]


class VacancyAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vacancy.objects.all()
    serializer_class = VacancyAdminSerializer
    permission_classes = [IsHiringAdmin]


class ApplicationAdminListView(generics.ListAPIView):
    serializer_class = ApplicationAdminSerializer
    permission_classes = [IsHiringAdmin]

    def get_queryset(self):
        qs = Application.objects.all()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class ApplicationAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Просмотр, смена статуса и удаление отклика (файл удаляется вместе с ним)."""

    queryset = Application.objects.all()
    serializer_class = ApplicationAdminSerializer
    permission_classes = [IsHiringAdmin]


class ResumeDownloadView(generics.GenericAPIView):
    """Отдаёт файл резюме: из приватного хранилища, только администраторам."""

    queryset = Application.objects.all()
    permission_classes = [IsHiringAdmin]

    def get(self, request, pk):
        application = self.get_object()
        if not application.resume:
            raise Http404
        filename = f"Резюме {application.name}{Path(application.resume.name).suffix}"
        return FileResponse(application.resume.open("rb"), as_attachment=True, filename=filename)
