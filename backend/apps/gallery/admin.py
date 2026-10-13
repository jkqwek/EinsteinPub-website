from django.contrib import admin
from django.utils.html import format_html

from .models import Photo


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ("preview", "caption", "sort_order")
    list_display_links = ("preview", "caption")
    list_editable = ("sort_order",)
    search_fields = ("caption",)

    @admin.display(description="Превью")
    def preview(self, obj):
        return format_html('<img src="{}" style="height:60px;" />', obj.image.url)
