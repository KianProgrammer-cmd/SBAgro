from django.urls import path
from .views import MyBuyerProfileView

urlpatterns = [
    path('me/', MyBuyerProfileView.as_view(), name='buyer-profile'),
]
