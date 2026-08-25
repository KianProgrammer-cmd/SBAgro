from django.urls import path
from .views import ProvinceListView, CityListView

urlpatterns = [
    path('provinces/', ProvinceListView.as_view(), name='province-list'),
    path('cities/', CityListView.as_view(), name='city-list'),
]
