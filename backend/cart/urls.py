from django.urls import path
from .views import MyCartView, CartItemCreateView, CartItemDetailView

urlpatterns = [
    path('', MyCartView.as_view(), name='my-cart'),
    path('items/', CartItemCreateView.as_view(), name='cart-item-create'),
    path('items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),
]
