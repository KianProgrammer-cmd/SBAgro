import requests
from django.conf import settings


def send_sms_notification(mobile: str, message: str):
    """Stub — wire up to your SMS provider (e.g. Kavenegar, Ghasedak)."""
    api_key = getattr(settings, 'SMS_API_KEY', '')
    if not api_key:
        return
    # Example placeholder request — replace with real provider endpoint.
    requests.post('https://api.sms-provider.example/send', json={
        'api_key': api_key, 'to': mobile, 'message': message,
    }, timeout=10)
