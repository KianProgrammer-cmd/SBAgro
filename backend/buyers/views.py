from rest_framework import generics
from core.permissions import IsBuyer
from .models import BuyerProfile
from .serializers import BuyerProfileSerializer


class MyBuyerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = BuyerProfileSerializer
    permission_classes = [IsBuyer]

    def get_object(self):
        profile, _ = BuyerProfile.objects.get_or_create(user=self.request.user)
        return profile
