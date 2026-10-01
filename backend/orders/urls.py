
from django.urls import path

from .views import (
    OrderListCreateView,
    OrderDetailView,
    SellerOrderItemsView,
    SellerOrderStatusUpdateView,
    ConfirmDeliveryView,
)

urlpatterns = [
    # Buyer
    path("", OrderListCreateView.as_view(), name="order-list-create"),

    # Single order
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),

    # Seller orders
    path("seller/", SellerOrderItemsView.as_view(), name="seller-orders"),

    # Seller changes PAID -> SHIPPED
    path(
        "<int:pk>/status/",
        SellerOrderStatusUpdateView.as_view(),
        name="seller-order-status-update",
    ),

    # Buyer confirms delivery using delivery code
    path(
        "<int:pk>/confirm-delivery/",
        ConfirmDeliveryView.as_view(),
        name="confirm-delivery",
    ),
]