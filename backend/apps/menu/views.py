from django.db.models import Prefetch
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import Category, Dish
from .serializers import (
    AdminCategorySerializer,
    AdminDishSerializer,
    CategorySerializer,
)


# --- Публичные ---

class MenuView(generics.ListAPIView):
    """Меню для сайта: активные категории, в каждой только доступные блюда."""

    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True).prefetch_related(
        Prefetch("dishes", queryset=Dish.objects.filter(is_available=True))
    )


# --- Админские ---

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("sort_order", "name")
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]


class AdminDishListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminDishSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Dish.objects.select_related("category").order_by("sort_order", "name")
        cat_id = self.request.query_params.get("category")
        if cat_id:
            qs = qs.filter(category_id=cat_id)
        return qs


class AdminDishDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Dish.objects.select_related("category")
    serializer_class = AdminDishSerializer
    permission_classes = [IsAdminUser]