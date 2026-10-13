from rest_framework import serializers

from apps.images import ImageUrlField
from .models import Category, Dish


class DishSerializer(serializers.ModelSerializer):
    """Публичный: фото как относительный URL, вложен в категорию."""
    image = ImageUrlField()

    class Meta:
        model = Dish
        fields = ["id", "name", "description", "price", "weight", "image"]


class CategorySerializer(serializers.ModelSerializer):
    dishes = DishSerializer(many=True)

    class Meta:
        model = Category
        fields = ["slug", "name", "dishes"]


class AdminCategorySerializer(serializers.ModelSerializer):
    dish_count = serializers.IntegerField(source="dishes.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "slug", "name", "sort_order", "is_active", "dish_count"]


class AdminDishSerializer(serializers.ModelSerializer):
    image = ImageUrlField(required=False, allow_null=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Dish
        fields = [
            "id", "category", "category_name", "name", "description",
            "price", "weight", "image", "sort_order", "is_available",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]