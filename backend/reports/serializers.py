from rest_framework import serializers


class PlatformStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=16, decimal_places=0)
    total_sellers = serializers.IntegerField()
    total_buyers = serializers.IntegerField()
    total_products = serializers.IntegerField()
