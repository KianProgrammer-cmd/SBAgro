from django.urls import path
from .views import MyInvoicesView

urlpatterns = [
    path('', MyInvoicesView.as_view(), name='my-invoices'),
]
