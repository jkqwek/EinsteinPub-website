from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from apps.bookings.views import BookingCreateView
from apps.events.views import EventListView
from apps.gallery.views import PhotoListView
from apps.menu.views import MenuView

admin.site.site_header = "Einstein Pub"
admin.site.site_title = "Einstein Pub"
admin.site.index_title = "Управление сайтом"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/menu/", MenuView.as_view()),
    path("api/events/", EventListView.as_view()),
    path("api/gallery/", PhotoListView.as_view()),
    path("api/bookings/", BookingCreateView.as_view()),
    # Загруженные фото; static() работает только при DEBUG, на сервере их отдаёт nginx
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
