from rest_framework import serializers

from .models import Product, ProductCategory


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = (
            "id",
            "name",
        )


class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(
        source="seller.username",
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "seller",
            "seller_name",
            "category",
            "title",
            "description",
            "image",
            "price_per_unit",
            "unit",
            "stock_quantity",
            "province",
            "city",
            "is_approved",
            "is_active",
            "rejection_reason",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "seller",
            "seller_name",
            "is_approved",
            "rejection_reason",
            "created_at",
            "updated_at",
        )

    def create(self, validated_data):
        request = self.context["request"]

        product = Product.objects.create(
            seller=request.user,
            **validated_data,
        )

        return product