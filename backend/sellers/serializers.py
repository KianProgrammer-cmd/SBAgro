from rest_framework import serializers
from .models import SellerProfile


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ('id', 'user', 'farm_name', 'bio', 'bank_account_number', 'bank_iban', 'is_verified')
        read_only_fields = ('is_verified', 'user')
