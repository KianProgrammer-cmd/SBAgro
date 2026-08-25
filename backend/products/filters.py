import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price_per_unit', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price_per_unit', lookup_expr='lte')

    class Meta:
        model = Product
        fields = ['province', 'city', 'category', 'min_price', 'max_price']
