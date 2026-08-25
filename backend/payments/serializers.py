from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'order', 'gateway', 'status', 'amount', 'gateway_ref_id', 'created_at', 'verified_at')
        read_only_fields = fields


class InitiatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    gateway = serializers.ChoiceField(choices=('ZARINPAL', 'PAYPAL'))
