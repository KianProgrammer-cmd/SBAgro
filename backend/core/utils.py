import uuid


def generate_order_number() -> str:
    return f"SB-{uuid.uuid4().hex[:10].upper()}"


def generate_invoice_number() -> str:
    return f"INV-{uuid.uuid4().hex[:10].upper()}"
