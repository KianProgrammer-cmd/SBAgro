from django.urls import path
from .views import OrderListCreateView, OrderDetailView, SellerOrderItemsView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('seller/', SellerOrderItemsView.as_view(), name='seller-orders'),
]
