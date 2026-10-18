from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import Event
from .serializers import EventAdminSerializer, EventSerializer

# Публичные вьюхи

class EventListView(generics.ListAPIView):

    serializer_class = EventSerializer
    MAX_LIMIT = 100

    def get_queryset(self):
        qs = Event.objects.filter(is_published=True).order_by("starts_at")

        raw = self.request.query_params.get("limit")
        if raw:
            try:
                limit = int(raw)
            except (TypeError, ValueError):
                return qs
            if 0 < limit <= self.MAX_LIMIT:
                return qs[:limit]
        return qs


# Админские вьюхи

class EventAdminListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by("-starts_at")
    serializer_class = EventAdminSerializer
    permission_classes = (IsAdminUser,)


class EventAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventAdminSerializer
    permission_classes = (IsAdminUser,)