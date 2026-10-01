from rest_framework import serializers


class PlatformStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(
        max_digits=16,
        decimal_places=0,
    )
    total_sellers = serializers.IntegerField()
    total_buyers = serializers.IntegerField()
    total_products = serializers.IntegerField()
    approved_products = serializers.IntegerField()
    pending_products = serializers.IntegerField()
    inactive_products = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    paid_orders = serializers.IntegerField()
    shipped_orders = serializers.IntegerField()
    delivered_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()
    successful_payments = serializers.IntegerField()
    pending_payments = serializers.IntegerField()


class SalesSummarySerializer(serializers.Serializer):
    today = serializers.DecimalField(max_digits=16, decimal_places=0)
    this_week = serializers.DecimalField(max_digits=16, decimal_places=0)
    this_month = serializers.DecimalField(max_digits=16, decimal_places=0)
    all_time = serializers.DecimalField(max_digits=16, decimal_places=0)


class OrderStatusReportSerializer(serializers.Serializer):
    status = serializers.CharField()
    label = serializers.CharField()
    count = serializers.IntegerField()


class ProvinceReportSerializer(serializers.Serializer):
    province_id = serializers.IntegerField()
    province_name = serializers.CharField()
    product_count = serializers.IntegerField()
    sold_quantity = serializers.IntegerField()
    revenue = serializers.DecimalField(
        max_digits=16,
        decimal_places=0,
    )


class FullReportSerializer(serializers.Serializer):
    platform = PlatformStatsSerializer()
    sales = SalesSummarySerializer()
    order_statuses = OrderStatusReportSerializer(many=True)
    provinces = ProvinceReportSerializer(many=True)