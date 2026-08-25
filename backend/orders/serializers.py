from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=0, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_title', 'seller', 'quantity', 'unit_price', 'subtotal')
        read_only_fields = ('seller', 'unit_price')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_number', 'buyer', 'status', 'total_amount', 'shipping_address', 'items', 'created_at')
        read_only_fields = ('order_number', 'buyer', 'status', 'total_amount')
