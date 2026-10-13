from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.bookings.views import (
    AdminBookingDetailView,
    AdminBookingListView,
    BookingCreateView,
)
from apps.events.views import (
    EventAdminDetailView,
    EventAdminListCreateView,
    EventListView,
)
from apps.gallery.views import (
    AdminPhotoDetailView,
    AdminPhotoListCreateView,
    PhotoListView,
)
from apps.menu.views import (
    AdminCategoryDetailView,
    AdminCategoryListCreateView,
    AdminDishDetailView,
    AdminDishListCreateView,
    MenuView,
)

admin.site.site_header = "Einstein Pub"
admin.site.site_title = "Einstein Pub"
admin.site.index_title = "Управление сайтом"

urlpatterns = [
    path("admin/", admin.site.urls),

    # Публичное API
    path("api/menu/", MenuView.as_view()),
    path("api/events/", EventListView.as_view()),
    path("api/gallery/", PhotoListView.as_view()),
    path("api/bookings/", BookingCreateView.as_view()),

    # Авторизация для админки сайта
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),

    # Админ: события
    path("api/admin/events/", EventAdminListCreateView.as_view()),
    path("api/admin/events/<int:pk>/", EventAdminDetailView.as_view()),

    # Админ: меню
    path("api/admin/menu/categories/", AdminCategoryListCreateView.as_view()),
    path("api/admin/menu/categories/<int:pk>/", AdminCategoryDetailView.as_view()),
    path("api/admin/menu/dishes/", AdminDishListCreateView.as_view()),
    path("api/admin/menu/dishes/<int:pk>/", AdminDishDetailView.as_view()),

    # Админ: галерея
    path("api/admin/gallery/", AdminPhotoListCreateView.as_view()),
    path("api/admin/gallery/<int:pk>/", AdminPhotoDetailView.as_view()),

    # Админ: брони
    path("api/admin/bookings/", AdminBookingListView.as_view()),
    path("api/admin/bookings/<int:pk>/", AdminBookingDetailView.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)