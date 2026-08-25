from django.conf import settings
from django.db import transaction
from django.shortcuts import redirect
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from core.constants import PaymentStatus, OrderStatus
from core.throttling import PaymentRateThrottle
from orders.models import Order
from .gateways.zarinpal import ZarinPalGateway
from .gateways.paypal import PayPalGateway
from .models import Payment
from .serializers import InitiatePaymentSerializer, PaymentSerializer

GATEWAYS = {
    'ZARINPAL': ZarinPalGateway,
    'PAYPAL': PayPalGateway,
}


class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]
    throttle_scope = 'payment'

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = Order.objects.get(id=serializer.validated_data['order_id'], buyer=request.user)
        gateway_name = serializer.validated_data['gateway']

        payment = Payment.objects.create(
            order=order, buyer=request.user, gateway=gateway_name, amount=order.total_amount,
        )
        gateway = GATEWAYS[gateway_name]()
        callback_url = f'{settings.FRONTEND_URL}/payment/callback/{payment.id}/'
        redirect_url, authority = gateway.create_payment(
            amount=order.total_amount, order=order, callback_url=callback_url,
        )
        payment.gateway_authority = authority
        payment.save(update_fields=['gateway_authority'])
        return Response({'redirect_url': redirect_url, 'payment_id': payment.id})


class VerifyPaymentView(APIView):
    """
    Called by our own frontend AFTER the gateway redirects the user back —
    but the actual trust decision happens here, server-side, against the
    gateway's verify/capture API. This is never taken on the client's word.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, payment_id):
        payment = Payment.objects.select_for_update().get(id=payment_id, buyer=request.user)

        if payment.status == PaymentStatus.SUCCESS:
            return Response(PaymentSerializer(payment).data)  # idempotent

        gateway = GATEWAYS[payment.gateway]()
        success, ref_id, raw_data = gateway.verify_payment(
            authority_or_token=payment.gateway_authority, amount=payment.amount,
        )
        payment.raw_callback_data = raw_data
        payment.gateway_ref_id = ref_id
        payment.status = PaymentStatus.SUCCESS if success else PaymentStatus.FAILED
        payment.verified_at = payment.verified_at or __import__('django.utils.timezone', fromlist=['now']).now()
        payment.save()

        if success:
            payment.order.status = OrderStatus.PAID
            payment.order.save(update_fields=['status'])

        return Response(PaymentSerializer(payment).data)


class ZarinPalWebhookView(APIView):
    """
    Optional server-to-server confirmation endpoint, in addition to the
    user-facing verify flow above — some deployments prefer relying on
    this instead of / in addition to the redirect-triggered verify call.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        authority = request.data.get('authority')
        try:
            payment = Payment.objects.get(gateway_authority=authority, gateway='ZARINPAL')
        except Payment.DoesNotExist:
            return Response(status=404)

        if payment.status != PaymentStatus.SUCCESS:
            gateway = ZarinPalGateway()
            success, ref_id, raw = gateway.verify_payment(authority_or_token=authority, amount=payment.amount)
            payment.raw_callback_data = raw
            payment.gateway_ref_id = ref_id
            payment.status = PaymentStatus.SUCCESS if success else PaymentStatus.FAILED
            payment.save()
            if success:
                payment.order.status = OrderStatus.PAID
                payment.order.save(update_fields=['status'])

        return Response({'received': True})
