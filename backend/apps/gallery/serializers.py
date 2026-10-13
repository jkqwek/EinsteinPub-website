from rest_framework import serializers

from apps.images import ImageUrlField
from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    image = ImageUrlField()

    class Meta:
        model = Photo
        fields = ["id", "image", "caption"]


class AdminPhotoSerializer(serializers.ModelSerializer):
    image = ImageUrlField(required=False, allow_null=True)

    class Meta:
        model = Photo
        fields = ["id", "image", "caption", "sort_order"]