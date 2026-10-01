from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # =====================================================
    # Django Admin
    # =====================================================

    path(
        "admin/",
        admin.site.urls,
    ),

    # =====================================================
    # Authentication
    # =====================================================

    path(
        "api/auth/",
        include("users.urls"),
    ),

    # =====================================================
    # Sellers
    # =====================================================

    path(
        "api/sellers/",
        include("sellers.urls"),
    ),

    # =====================================================
    # Buyers
    # =====================================================

    path(
        "api/buyers/",
        include("buyers.urls"),
    ),

    # =====================================================
    # Locations
    # =====================================================

    path(
        "api/locations/",
        include("locations.urls"),
    ),

    # =====================================================
    # Products
    # =====================================================

    path(
        "api/products/",
        include("products.urls"),
    ),

    # =====================================================
    # Cart
    # =====================================================

    path(
        "api/cart/",
        include("cart.urls"),
    ),

    # =====================================================
    # Orders
    # =====================================================

    path(
        "api/orders/",
        include("orders.urls"),
    ),

    # =====================================================
    # Payments
    # =====================================================

    path(
        "api/payments/",
        include("payments.urls"),
    ),

    # =====================================================
    # Invoices
    # =====================================================

    path(
        "api/invoices/",
        include("invoices.urls"),
    ),

    # =====================================================
    # Notifications
    # =====================================================

    path(
        "api/notifications/",
        include("notifications.urls"),
    ),

    # =====================================================
    # Reports
    # =====================================================

    path(
        "api/reports/",
        include("reports.urls"),
    ),
]


# =========================================================
# Media files in development
# =========================================================

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )