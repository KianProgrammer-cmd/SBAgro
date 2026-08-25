from rest_framework import serializers
from .models import Product, ProductCategory


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ('id', 'name')


class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'seller', 'seller_name', 'category', 'title', 'description', 'image',
            'price_per_unit', 'unit', 'stock_quantity', 'province', 'city',
            'is_approved', 'is_active', 'created_at',
        )
        read_only_fields = ('seller', 'is_approved')

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)
