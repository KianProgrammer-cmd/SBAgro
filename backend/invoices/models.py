from django.db import models
from core.utils import generate_invoice_number


class Invoice(models.Model):
    order = models.OneToOneField('orders.Order', related_name='invoice', on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=20, unique=True, default=generate_invoice_number)
    pdf_file = models.FileField(upload_to='documents/invoices/', blank=True, null=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoices'

    def __str__(self):
        return self.invoice_number
