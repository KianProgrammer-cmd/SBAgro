from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from core.permissions import IsBuyer, IsSeller
from cart.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        buyer = self.request.user
        cart = Cart.objects.filter(buyer=buyer).select_related().prefetch_related('items__product').first()
        if not cart or not cart.items.exists():
            raise ValidationError('سبد خرید خالی است.')

        total = sum(item.subtotal for item in cart.items.all())
        order = serializer.save(buyer=buyer, total_amount=total)

        for item in cart.items.all():
            if item.quantity > item.product.stock_quantity:
                raise ValidationError(f'موجودی «{item.product.title}» کافی نیست.')
            OrderItem.objects.create(
                order=order,
                product=item.product,
                seller=item.product.seller,
                quantity=item.quantity,
                unit_price=item.product.price_per_unit,
            )
            item.product.stock_quantity -= item.quantity
            item.product.save(update_fields=['stock_quantity'])

        cart.items.all().delete()


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Order.objects.all()
        if user.role == 'SELLER':
            return Order.objects.filter(items__seller=user).distinct()
        return Order.objects.filter(buyer=user)


class SellerOrderItemsView(generics.ListAPIView):
    """Orders (line items) that belong to the logged-in seller."""
    permission_classes = [IsSeller]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(items__seller=self.request.user).distinct()
