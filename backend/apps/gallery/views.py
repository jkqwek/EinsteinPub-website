from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import Photo
from .serializers import AdminPhotoSerializer, PhotoSerializer
from apps.users.views import IsSuperAdmin


class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoSerializer
    queryset = Photo.objects.all()


class AdminPhotoListCreateView(generics.ListCreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = AdminPhotoSerializer
    permission_classes = [IsSuperAdmin]


class AdminPhotoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Photo.objects.all()
    serializer_class = AdminPhotoSerializer
    permission_classes = [IsSuperAdmin]