from rest_framework import generics
from core.permissions import IsSeller
from .models import SellerProfile
from .serializers import SellerProfileSerializer


class MySellerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [IsSeller]

    def get_object(self):
        profile, _ = SellerProfile.objects.get_or_create(user=self.request.user)
        return profile
