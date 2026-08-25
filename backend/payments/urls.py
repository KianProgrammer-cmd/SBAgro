from django.urls import path
from .views import InitiatePaymentView, VerifyPaymentView, ZarinPalWebhookView

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('verify/<int:payment_id>/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('webhook/zarinpal/', ZarinPalWebhookView.as_view(), name='zarinpal-webhook'),
]
