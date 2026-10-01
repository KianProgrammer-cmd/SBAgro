from rest_framework import serializers

from .models import Province, City


class ProvinceSerializer(serializers.ModelSerializer):
    city_count = serializers.SerializerMethodField()

    class Meta:
        model = Province

        fields = (
            "id",
            "name",
            "name_en",
            "code",
            "city_count",
        )

    def get_city_count(self, obj):
        return obj.cities.count()


class CitySerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(
        source="province.name",
        read_only=True,
    )

    class Meta:
        model = City

        fields = (
            "id",
            "name",
            "name_en",
            "code",
            "province",
            "province_name",
        )