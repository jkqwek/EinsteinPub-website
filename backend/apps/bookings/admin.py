from django.contrib import admin
from django.utils import timezone

from .models import Booking


class VisitDateFilter(admin.SimpleListFilter):
    """Фильтр по дате визита. Без выбора показывает сегодняшние и будущие брони."""

    title = "Дата визита"
    parameter_name = "visit"

    def lookups(self, request, model_admin):
        return [
            ("upcoming", "Сегодня и позже"),
            ("today", "Сегодня"),
            ("past", "Прошедшие"),
            ("all", "Все"),
        ]

    # Свой список вместо стандартного: у стандартного пункт «Все» означает «без фильтра»,
    # а здесь без фильтра действует «Сегодня и позже»
    def choices(self, changelist):
        for value, label in self.lookup_choices:
            yield {
                "selected": (self.value() or "upcoming") == value,
                "query_string": changelist.get_query_string(
                    {self.parameter_name: value}
                ),
                "display": label,
            }

    def queryset(self, request, queryset):
        today = timezone.localdate()
        match self.value() or "upcoming":
            case "upcoming":
                return queryset.filter(date__gte=today)
            case "today":
                return queryset.filter(date=today)
            case "past":
                return queryset.filter(date__lt=today)
        return queryset


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("date", "time", "name", "phone", "guests", "status", "created_at")
    list_display_links = ("date", "time", "name")
    list_editable = ("status",)
    list_filter = (VisitDateFilter, "status")
    search_fields = ("name", "phone")
