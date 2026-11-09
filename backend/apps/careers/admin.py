from django.contrib import admin

from .models import Application, Vacancy


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ("title", "schedule", "salary", "is_open", "sort_order")
    list_editable = ("is_open", "sort_order")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "position", "phone", "status")
    list_display_links = ("created_at", "name")
    list_editable = ("status",)
    list_filter = ("status", "position")
    search_fields = ("name", "phone", "email")
