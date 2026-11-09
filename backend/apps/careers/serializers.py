from pathlib import Path

from rest_framework import serializers

from apps.bookings.serializers import clean_phone
from .models import Application, Vacancy

MAX_RESUME_SIZE = 5 * 1024 * 1024
# Расширение -> первые байты файла: проверяем содержимое, а не только имя
RESUME_SIGNATURES = {
    ".pdf": b"%PDF",
    ".docx": b"PK\x03\x04",
    ".doc": b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",
}


class VacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = ["id", "title", "description", "schedule", "salary"]


class VacancyAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = ["id", "title", "description", "schedule", "salary", "is_open", "sort_order"]


class ApplicationSerializer(serializers.ModelSerializer):
    """Публичный отклик. vacancy — id открытой вакансии, без него — «Любая вакансия»."""

    vacancy = serializers.PrimaryKeyRelatedField(
        queryset=Vacancy.objects.filter(is_open=True),
        required=False,
        allow_null=True,
        write_only=True,
        error_messages={"does_not_exist": "Эта вакансия уже закрыта. Обновите страницу."},
    )
    adult = serializers.BooleanField(write_only=True)
    consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = Application
        fields = ["vacancy", "name", "phone", "email", "about", "resume", "adult", "consent"]

    def validate_phone(self, value):
        return clean_phone(value)

    def validate_adult(self, value):
        if not value:
            raise serializers.ValidationError("Работать у нас можно с 18 лет.")
        return value

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                "Нужно согласие на обработку персональных данных."
            )
        return value

    def validate_resume(self, file):
        if file.size > MAX_RESUME_SIZE:
            raise serializers.ValidationError("Файл резюме больше 5 МБ.")
        signature = RESUME_SIGNATURES.get(Path(file.name).suffix.lower())
        head = file.read(len(signature or b""))
        file.seek(0)
        if not signature or head != signature:
            raise serializers.ValidationError("Приложите резюме в формате PDF, DOC или DOCX.")
        return file

    def validate(self, data):
        if not data.get("about", "").strip() and not data.get("resume"):
            raise serializers.ValidationError(
                {"about": "Приложите файл резюме или расскажите о себе."}
            )
        return data

    def create(self, validated_data):
        vacancy = validated_data.pop("vacancy", None)
        validated_data.pop("adult")
        validated_data.pop("consent")
        return Application.objects.create(
            position=vacancy.title if vacancy else "", **validated_data
        )


class ApplicationAdminSerializer(serializers.ModelSerializer):
    """Админский: отклик только читается, меняется лишь статус.
    Вместо файла — его имя; сам файл отдаёт ResumeDownloadView."""

    resume_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id", "position", "name", "phone", "email", "about",
            "resume_name", "status", "created_at",
        ]
        read_only_fields = ["position", "name", "phone", "email", "about", "created_at"]

    def get_resume_name(self, obj):
        return Path(obj.resume.name).name if obj.resume else ""
