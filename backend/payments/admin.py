from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'gateway', 'status', 'amount', 'created_at')
    list_filter = ('gateway', 'status')
    readonly_fields = [f.name for f in Payment._meta.fields]
