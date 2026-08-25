from rest_framework import generics, permissions
from .models import Province, City
from .serializers import ProvinceSerializer, CitySerializer


class ProvinceListView(generics.ListAPIView):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]


class CityListView(generics.ListAPIView):
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = City.objects.all()
        province_id = self.request.query_params.get('province')
        if province_id:
            qs = qs.filter(province_id=province_id)
        return qs
