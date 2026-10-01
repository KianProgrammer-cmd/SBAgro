from rest_framework import generics, permissions

from .models import Province, City
from .serializers import (
    ProvinceSerializer,
    CitySerializer,
)


class ProvinceListView(generics.ListAPIView):
    """
    دریافت تمام استان‌های ایران
    """

    queryset = Province.objects.all().order_by("name")
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]


class CityListView(generics.ListAPIView):
    """
    دریافت شهرهای یک استان

    مثال:

    /api/locations/cities/?province=1
    """

    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = City.objects.select_related(
            "province"
        ).order_by("name")

        province_id = self.request.query_params.get(
            "province"
        )

        if province_id:
            queryset = queryset.filter(
                province_id=province_id
            )

        return queryset