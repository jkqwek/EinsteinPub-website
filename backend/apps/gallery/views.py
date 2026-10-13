from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import Photo
from .serializers import AdminPhotoSerializer, PhotoSerializer


class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoSerializer
    queryset = Photo.objects.all()


class AdminPhotoListCreateView(generics.ListCreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = AdminPhotoSerializer
    permission_classes = [IsAdminUser]


class AdminPhotoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Photo.objects.all()
    serializer_class = AdminPhotoSerializer
    permission_classes = [IsAdminUser]