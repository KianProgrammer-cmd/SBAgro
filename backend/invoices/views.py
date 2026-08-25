from rest_framework import generics, permissions
from .models import Invoice
from .serializers import InvoiceSerializer


class MyInvoicesView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Invoice.objects.all()
        if user.role == 'SELLER':
            return Invoice.objects.filter(order__items__seller=user).distinct()
        return Invoice.objects.filter(order__buyer=user)
