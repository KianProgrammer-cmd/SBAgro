import secrets

from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone


def generate_delivery_code():
    """
    Generate a secure 6-digit delivery confirmation code.
    """

    return f"{secrets.randbelow(1_000_000):06d}"


def set_delivery_code(order):
    """
    Generate and store a hashed delivery code.

    Returns:
        raw_code: The code that should be shown to the buyer.
    """

    raw_code = generate_delivery_code()

    order.delivery_code_hash = make_password(raw_code)
    order.delivery_code_created_at = timezone.now()

    order.save(
        update_fields=[
            "delivery_code_hash",
            "delivery_code_created_at",
        ]
    )

    return raw_code


def verify_delivery_code(order, raw_code):
    """
    Verify the buyer's delivery code.
    """

    if not order.delivery_code_hash:
        return False

    return check_password(
        str(raw_code),
        order.delivery_code_hash,
    )