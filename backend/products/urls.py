from django.urls import path

from .views import (
    ProductListCreateView,
    ProductDetailView,
    MyProductsView,
    CategoryListView,
    AdminProductListView,
    AdminApproveProductView,
    AdminRejectProductView,
    AdminDeleteProductView,
)


urlpatterns = [
    # محصولات عمومی
    path(
        "",
        ProductListCreateView.as_view(),
        name="product-list-create",
    ),

    path(
        "mine/",
        MyProductsView.as_view(),
        name="my-products",
    ),

    path(
        "categories/",
        CategoryListView.as_view(),
        name="product-categories",
    ),

    path(
        "<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),

    # =====================================================
    # ADMIN
    # =====================================================

    path(
        "admin/",
        AdminProductListView.as_view(),
        name="admin-products",
    ),

    path(
        "admin/<int:pk>/approve/",
        AdminApproveProductView.as_view(),
        name="admin-product-approve",
    ),

    path(
        "admin/<int:pk>/reject/",
        AdminRejectProductView.as_view(),
        name="admin-product-reject",
    ),

    path(
        "admin/<int:pk>/delete/",
        AdminDeleteProductView.as_view(),
        name="admin-product-delete",
    ),
]