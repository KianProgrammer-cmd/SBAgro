from django.conf import settings
from django.db import models
from core.constants import OrderStatus
from core.utils import generate_order_number


class Order(models.Model):
    order_number = models.CharField(max_length=20, unique=True, default=generate_order_number)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='orders', on_delete=models.PROTECT)
    status = models.CharField(max_length=15, choices=OrderStatus.CHOICES, default=OrderStatus.PENDING)
    total_amount = models.DecimalField(max_digits=14, decimal_places=0)
    shipping_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sold_order_items', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=0)  # price at time of purchase

    class Meta:
        db_table = 'order_items'

    @property
    def subtotal(self):
        return self.unit_price * self.quantity
