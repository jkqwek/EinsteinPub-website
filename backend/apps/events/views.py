from django.utils import timezone
from rest_framework import generics, serializers

from apps.images import ImageUrlField
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    image = ImageUrlField()

    class Meta:
        model = Event
        fields = ["id", "title", "starts_at", "description", "image"]


class EventListView(generics.ListAPIView):
    """Опубликованные события начиная с сегодняшнего: сегодняшнее видно до конца дня."""

    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.filter(
            is_published=True, starts_at__date__gte=timezone.localdate()
        )
