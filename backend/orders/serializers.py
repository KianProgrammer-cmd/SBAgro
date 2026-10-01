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


class SellerOrderItemSerializer(serializers.ModelSerializer):
    """Order item view scoped to the seller's own line items only."""
    product_title = serializers.CharField(source='product.title', read_only=True)
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=0, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_title', 'quantity', 'unit_price', 'subtotal')


class SellerOrderSerializer(serializers.ModelSerializer):
    """
    Order view for sellers: only exposes the requesting seller's own items
    and their subtotal — never other sellers' items/prices within the same
    order, and never the buyer's full order total.
    """
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    buyer_mobile = serializers.CharField(source='buyer.mobile', read_only=True)
    items = serializers.SerializerMethodField()
    seller_subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'buyer_name', 'buyer_mobile',
            'status', 'shipping_address', 'items', 'seller_subtotal', 'created_at',
        )

    def _seller_items(self, obj):
        request = self.context.get('request')
        seller = getattr(request, 'user', None)
        return obj.items.filter(seller=seller)

    def get_items(self, obj):
        return SellerOrderItemSerializer(self._seller_items(obj), many=True).data

    def get_seller_subtotal(self, obj):
        return sum((item.subtotal for item in self._seller_items(obj)), 0)
    
class ConfirmDeliverySerializer(serializers.Serializer):
    code = serializers.CharField(
        min_length=6,
        max_length=6,
        write_only=True,
    )

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "کد تحویل باید فقط شامل اعداد باشد."
            )

        return value