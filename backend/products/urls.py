from django.urls import path
from .views import ProductListCreateView, ProductDetailView, MyProductsView, CategoryListView

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('mine/', MyProductsView.as_view(), name='my-products'),
    path('categories/', CategoryListView.as_view(), name='product-categories'),
]
