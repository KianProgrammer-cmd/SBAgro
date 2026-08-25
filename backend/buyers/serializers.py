from rest_framework import serializers
from .models import BuyerProfile


class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = ('id', 'user', 'shipping_address', 'postal_code')
        read_only_fields = ('user',)
