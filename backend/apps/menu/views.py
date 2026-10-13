from django.db.models import Prefetch
from rest_framework import generics, serializers

from apps.images import ImageUrlField
from .models import Category, Dish


class DishSerializer(serializers.ModelSerializer):
    image = ImageUrlField()

    class Meta:
        model = Dish
        fields = ["id", "name", "description", "price", "weight", "image"]


class CategorySerializer(serializers.ModelSerializer):
    dishes = DishSerializer(many=True)

    class Meta:
        model = Category
        fields = ["slug", "name", "dishes"]


class MenuView(generics.ListAPIView):
    """Меню для сайта: активные категории, в каждой только доступные блюда."""

    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True).prefetch_related(
        Prefetch("dishes", queryset=Dish.objects.filter(is_available=True))
    )
