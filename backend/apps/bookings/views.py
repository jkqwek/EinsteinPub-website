from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from rest_framework.throttling import ScopedRateThrottle

from .models import Booking
from .serializers import AdminBookingSerializer, BookingSerializer


class BookingCreateView(generics.CreateAPIView):
    """Заявка на бронь с сайта. Не больше 5 заявок в час с одного IP."""

    serializer_class = BookingSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "bookings"


class AdminBookingListView(generics.ListAPIView):
    serializer_class = AdminBookingSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Booking.objects.all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminBookingDetailView(generics.RetrieveUpdateAPIView):
    """Просмотр и обновление статуса брони. Остальные поля — read-only."""

    queryset = Booking.objects.all()
    serializer_class = AdminBookingSerializer
    permission_classes = [IsAdminUser]