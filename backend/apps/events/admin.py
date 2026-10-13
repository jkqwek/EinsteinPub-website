from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "starts_at", "is_published")
    list_editable = ("is_published",)
    list_filter = ("is_published",)
    search_fields = ("title", "description")
    date_hierarchy = "starts_at"
    ordering = ("-starts_at",)
