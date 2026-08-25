import requests
from django.conf import settings
from rest_framework import serializers


TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify_turnstile(token, remote_ip=None):
    if not token:
        raise serializers.ValidationError(
            {"captcha": "لطفاً کپچا را تکمیل کنید."}
        )

    secret = getattr(settings, "TURNSTILE_SECRET_KEY", "")

    if not secret:
        raise serializers.ValidationError(
            {"captcha": "تنظیمات کپچا در سرور کامل نیست."}
        )

    try:
        response = requests.post(
            TURNSTILE_VERIFY_URL,
            data={
                "secret": secret,
                "response": token,
                "remoteip": remote_ip,
            },
            timeout=10,
        )

        response.raise_for_status()
        result = response.json()

    except requests.RequestException:
        raise serializers.ValidationError(
            {"captcha": "ارتباط با سرویس کپچا برقرار نشد. دوباره تلاش کنید."}
        )

    if not result.get("success"):
        raise serializers.ValidationError(
            {"captcha": "اعتبارسنجی کپچا ناموفق بود. لطفاً دوباره تلاش کنید."}
        )

    return True
