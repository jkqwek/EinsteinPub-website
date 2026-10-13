from rest_framework import serializers

from apps.images import ImageUrlField
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Публичный: только для чтения, отдаёт относительный URL картинки."""
    image = ImageUrlField()

    class Meta:
        model = Event
        fields = ["id", "title", "starts_at", "description", "image"]


class EventAdminSerializer(serializers.ModelSerializer):
    """Админский: полный CRUD, принимает загрузку картинки."""
    image = ImageUrlField(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "starts_at", "description",
            "image", "is_published",
        ]