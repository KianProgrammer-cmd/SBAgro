from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ('id', 'order', 'invoice_number', 'pdf_file', 'issued_at')
        read_only_fields = fields
