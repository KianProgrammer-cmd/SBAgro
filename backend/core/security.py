"""
Shared security helpers: signature verification, payment idempotency
keys, and safe-file validation used across payments and products apps.
"""
import hashlib
import hmac
import uuid


def generate_idempotency_key() -> str:
    return uuid.uuid4().hex


def constant_time_compare(val1: str, val2: str) -> bool:
    return hmac.compare_digest(val1, val2)


def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return constant_time_compare(expected, signature)


ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_IMAGE_SIZE_MB = 5


def validate_uploaded_image(uploaded_file):
    import os
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError('نوع فایل مجاز نیست.')
    if uploaded_file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise ValueError(f'حجم فایل نباید بیشتر از {MAX_IMAGE_SIZE_MB}MB باشد.')
