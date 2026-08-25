"""Generates a simple invoice PDF using reportlab. Wire this into a
post-payment-success signal/task to auto-generate invoices."""
from io import BytesIO
from reportlab.pdfgen import canvas


def generate_invoice_pdf(invoice) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 800, f"Invoice: {invoice.invoice_number}")
    c.drawString(100, 780, f"Order: {invoice.order.order_number}")
    c.drawString(100, 760, f"Total: {invoice.order.total_amount} Toman")
    for i, item in enumerate(invoice.order.items.all()):
        c.drawString(100, 740 - (i * 20), f"{item.product.title} x{item.quantity} = {item.subtotal}")
    c.save()
    return buf.getvalue()
