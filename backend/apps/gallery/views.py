from rest_framework import generics, serializers

from apps.images import ImageUrlField
from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    image = ImageUrlField()

    class Meta:
        model = Photo
        fields = ["id", "image", "caption"]


class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoSerializer
    queryset = Photo.objects.all()
