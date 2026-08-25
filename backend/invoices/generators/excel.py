"""Generates an Excel export of orders/invoices for admin reporting."""
from io import BytesIO
from openpyxl import Workbook


def generate_orders_excel(orders) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.append(['Order Number', 'Buyer', 'Status', 'Total', 'Created At'])
    for order in orders:
        ws.append([order.order_number, order.buyer.username, order.status, float(order.total_amount), str(order.created_at)])
    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()
