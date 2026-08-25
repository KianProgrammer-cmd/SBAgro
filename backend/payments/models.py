from django.conf import settings
from django.db import models
from core.constants import PaymentGateway, PaymentStatus
from core.security import generate_idempotency_key


class Payment(models.Model):
    order = models.ForeignKey('orders.Order', related_name='payments', on_delete=models.CASCADE)
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    gateway = models.CharField(max_length=10, choices=PaymentGateway.CHOICES)
    status = models.CharField(max_length=10, choices=PaymentStatus.CHOICES, default=PaymentStatus.PENDING)
    amount = models.DecimalField(max_digits=14, decimal_places=0)
    idempotency_key = models.CharField(max_length=64, unique=True, default=generate_idempotency_key)
    gateway_authority = models.CharField(max_length=100, blank=True)  # ZarinPal "Authority"
    gateway_ref_id = models.CharField(max_length=100, blank=True)     # ZarinPal "RefID" / PayPal capture id
    raw_callback_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order.order_number} - {self.gateway} - {self.status}"
