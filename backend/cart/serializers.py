from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=0, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_detail', 'quantity', 'subtotal')

    def validate(self, attrs):
        product = attrs.get('product') or self.instance.product
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', 1))
        if quantity > product.stock_quantity:
            raise serializers.ValidationError('موجودی کافی نیست.')
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total')

    def get_total(self, obj):
        return sum(item.subtotal for item in obj.items.all())
