"""
PayPal Orders v2 API integration.
Docs: https://developer.paypal.com/docs/api/orders/v2/
"""
import requests
from django.conf import settings
from .base import BaseGateway

SANDBOX_BASE = 'https://api-m.sandbox.paypal.com'
LIVE_BASE = 'https://api-m.paypal.com'


class PayPalGateway(BaseGateway):
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.base_url = SANDBOX_BASE if settings.PAYPAL_MODE == 'sandbox' else LIVE_BASE

    def _get_access_token(self):
        resp = requests.post(
            f'{self.base_url}/v1/oauth2/token',
            auth=(self.client_id, self.client_secret),
            data={'grant_type': 'client_credentials'},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()['access_token']

    def create_payment(self, *, amount, order, callback_url):
        token = self._get_access_token()
        payload = {
            'intent': 'CAPTURE',
            'purchase_units': [{
                'reference_id': order.order_number,
                'amount': {'currency_code': 'USD', 'value': f'{amount:.2f}'},
            }],
            'application_context': {
                'return_url': f'{callback_url}?success=1',
                'cancel_url': f'{callback_url}?success=0',
            },
        }
        resp = requests.post(
            f'{self.base_url}/v2/checkout/orders',
            json=payload,
            headers={'Authorization': f'Bearer {token}'},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        approve_link = next(link['href'] for link in data['links'] if link['rel'] == 'approve')
        return approve_link, data['id']

    def verify_payment(self, *, authority_or_token, amount):
        token = self._get_access_token()
        resp = requests.post(
            f'{self.base_url}/v2/checkout/orders/{authority_or_token}/capture',
            headers={'Authorization': f'Bearer {token}'},
            timeout=15,
        )
        body = resp.json()
        success = resp.status_code in (200, 201) and body.get('status') == 'COMPLETED'
        ref_id = body.get('id', '')
        return success, ref_id, body
