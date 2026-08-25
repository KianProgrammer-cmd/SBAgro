"""
ZarinPal payment gateway integration.
Docs: https://www.zarinpal.com/docs/paymentGateway/
NOTE: verify_payment must always be called server-side against ZarinPal's
API — never trust the client-side redirect/query params alone.
"""
import requests
from django.conf import settings
from .base import BaseGateway

SANDBOX_BASE = 'https://sandbox.zarinpal.com/pg/v4/payment'
LIVE_BASE = 'https://payment.zarinpal.com/pg/v4/payment'


class ZarinPalGateway(BaseGateway):
    def __init__(self):
        self.merchant_id = settings.ZARINPAL_MERCHANT_ID
        self.base_url = SANDBOX_BASE if settings.ZARINPAL_SANDBOX else LIVE_BASE

    def create_payment(self, *, amount, order, callback_url):
        payload = {
            'merchant_id': self.merchant_id,
            'amount': int(amount),  # Toman
            'callback_url': callback_url,
            'description': f'پرداخت سفارش {order.order_number}',
        }
        resp = requests.post(f'{self.base_url}/request.json', json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json().get('data', {})
        authority = data.get('authority')
        if not authority:
            raise RuntimeError(f'ZarinPal request failed: {resp.json()}')
        pay_url_base = 'sandbox.zarinpal.com' if settings.ZARINPAL_SANDBOX else 'payment.zarinpal.com'
        redirect_url = f'https://{pay_url_base}/pg/StartPay/{authority}'
        return redirect_url, authority

    def verify_payment(self, *, authority_or_token, amount):
        payload = {
            'merchant_id': self.merchant_id,
            'amount': int(amount),
            'authority': authority_or_token,
        }
        resp = requests.post(f'{self.base_url}/verify.json', json=payload, timeout=15)
        resp.raise_for_status()
        body = resp.json()
        data = body.get('data', {})
        success = data.get('code') in (100, 101)
        ref_id = str(data.get('ref_id', ''))
        return success, ref_id, body
