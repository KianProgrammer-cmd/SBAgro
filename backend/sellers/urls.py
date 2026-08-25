from django.urls import path
from .views import MySellerProfileView

urlpatterns = [
    path('me/', MySellerProfileView.as_view(), name='seller-profile'),
]
