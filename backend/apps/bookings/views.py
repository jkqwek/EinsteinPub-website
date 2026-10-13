import re
from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, serializers
from rest_framework.throttling import ScopedRateThrottle

from .models import Booking

TIME_SLOTS = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
MAX_DAYS_AHEAD = 60


class BookingSerializer(serializers.ModelSerializer):
    consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = Booking
        fields = ["name", "phone", "guests", "date", "time", "wishes", "consent"]

    def validate_phone(self, value):
        if not 10 <= len(re.sub(r"\D", "", value)) <= 15:
            raise serializers.ValidationError("Проверьте номер телефона.")
        return value

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                "Нужно согласие на обработку персональных данных."
            )
        return value

    def validate(self, data):
        now = timezone.localtime()
        today = now.date()
        if not today <= data["date"] <= today + timedelta(days=MAX_DAYS_AHEAD):
            raise serializers.ValidationError(
                {"date": f"Бронь возможна на ближайшие {MAX_DAYS_AHEAD} дней."}
            )
        if data["time"].strftime("%H:%M") not in TIME_SLOTS:
            raise serializers.ValidationError({"time": "Выберите время из списка."})
        if data["date"] == today and data["time"] <= now.time():
            raise serializers.ValidationError({"time": "Это время уже прошло."})
        return data

    def create(self, validated_data):
        validated_data.pop("consent")
        return super().create(validated_data)


class BookingCreateView(generics.CreateAPIView):
    """Заявка на бронь с сайта. Не больше 5 заявок в час с одного IP (настройка в settings)."""

    serializer_class = BookingSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "bookings"
