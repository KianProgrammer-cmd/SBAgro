from django.db.models import Sum, Count
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdmin
from core.constants import OrderStatus
from orders.models import Order
from products.models import Product
from users.models import User
from .serializers import PlatformStatsSerializer


class PlatformStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        paid_orders = Order.objects.filter(status=OrderStatus.PAID)
        data = {
            'total_orders': Order.objects.count(),
            'total_revenue': paid_orders.aggregate(s=Sum('total_amount'))['s'] or 0,
            'total_sellers': User.objects.filter(role='SELLER').count(),
            'total_buyers': User.objects.filter(role='BUYER').count(),
            'total_products': Product.objects.count(),
        }
        return Response(PlatformStatsSerializer(data).data)
