from datetime import timedelta

from django.db.models import Count, Sum, F, DecimalField, ExpressionWrapper
from django.db.models.functions import Coalesce
from django.utils import timezone

from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdmin
from core.constants import OrderStatus, PaymentStatus, UserRole

from orders.models import Order, OrderItem
from payments.models import Payment
from products.models import Product
from users.models import User

from .serializers import (
    PlatformStatsSerializer,
    SalesSummarySerializer,
    OrderStatusReportSerializer,
    ProvinceReportSerializer,
    FullReportSerializer,
)


def zero_decimal():
    return 0


class PlatformStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        paid_orders = Order.objects.filter(
            status__in=[
                OrderStatus.PAID,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
            ]
        )

        successful_payments = Payment.objects.filter(
            status=PaymentStatus.SUCCESS
        )

        data = {
            "total_orders": Order.objects.count(),

            "total_revenue": paid_orders.aggregate(
                total=Coalesce(
                    Sum("total_amount"),
                    0,
                    output_field=DecimalField(
                        max_digits=16,
                        decimal_places=0,
                    ),
                )
            )["total"],

            "total_sellers": User.objects.filter(
                role=UserRole.SELLER
            ).count(),

            "total_buyers": User.objects.filter(
                role=UserRole.BUYER
            ).count(),

            "total_products": Product.objects.count(),

            "approved_products": Product.objects.filter(
                is_approved=True
            ).count(),

            "pending_products": Product.objects.filter(
                is_approved=False,
                is_active=True,
            ).count(),

            "inactive_products": Product.objects.filter(
                is_active=False
            ).count(),

            "pending_orders": Order.objects.filter(
                status=OrderStatus.PENDING
            ).count(),

            "paid_orders": Order.objects.filter(
                status=OrderStatus.PAID
            ).count(),

            "shipped_orders": Order.objects.filter(
                status=OrderStatus.SHIPPED
            ).count(),

            "delivered_orders": Order.objects.filter(
                status=OrderStatus.DELIVERED
            ).count(),

            "cancelled_orders": Order.objects.filter(
                status=OrderStatus.CANCELLED
            ).count(),

            "successful_payments": successful_payments.count(),

            "pending_payments": Payment.objects.filter(
                status=PaymentStatus.PENDING
            ).count(),
        }

        serializer = PlatformStatsSerializer(data)

        return Response(serializer.data)


class SalesSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()

        today_start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        week_start = today_start - timedelta(
            days=today_start.weekday()
        )

        month_start = today_start.replace(day=1)

        successful = Payment.objects.filter(
            status=PaymentStatus.SUCCESS
        )

        today = successful.filter(
            created_at__gte=today_start
        ).aggregate(
            total=Coalesce(
                Sum("amount"),
                0,
                output_field=DecimalField(
                    max_digits=16,
                    decimal_places=0,
                ),
            )
        )["total"]

        this_week = successful.filter(
            created_at__gte=week_start
        ).aggregate(
            total=Coalesce(
                Sum("amount"),
                0,
                output_field=DecimalField(
                    max_digits=16,
                    decimal_places=0,
                ),
            )
        )["total"]

        this_month = successful.filter(
            created_at__gte=month_start
        ).aggregate(
            total=Coalesce(
                Sum("amount"),
                0,
                output_field=DecimalField(
                    max_digits=16,
                    decimal_places=0,
                ),
            )
        )["total"]

        all_time = successful.aggregate(
            total=Coalesce(
                Sum("amount"),
                0,
                output_field=DecimalField(
                    max_digits=16,
                    decimal_places=0,
                ),
            )
        )["total"]

        data = {
            "today": today,
            "this_week": this_week,
            "this_month": this_month,
            "all_time": all_time,
        }

        return Response(
            SalesSummarySerializer(data).data
        )


class OrderStatusReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        labels = {
            OrderStatus.PENDING: "در انتظار پرداخت",
            OrderStatus.PAID: "پرداخت شده",
            OrderStatus.SHIPPED: "ارسال شده",
            OrderStatus.DELIVERED: "تحویل شده",
            OrderStatus.CANCELLED: "لغو شده",
        }

        rows = []

        for status, label in labels.items():
            rows.append(
                {
                    "status": status,
                    "label": label,
                    "count": Order.objects.filter(
                        status=status
                    ).count(),
                }
            )

        return Response(
            OrderStatusReportSerializer(
                rows,
                many=True,
            ).data
        )


class ProvinceReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        products = Product.objects.values(
            "province_id",
            "province__name",
        ).annotate(
            product_count=Count("id"),
        )

        result = []

        for province in products:
            province_id = province["province_id"]

            items = OrderItem.objects.filter(
                product__province_id=province_id,
                order__status__in=[
                    OrderStatus.PAID,
                    OrderStatus.SHIPPED,
                    OrderStatus.DELIVERED,
                ],
            )

            sold_quantity = items.aggregate(
                total=Coalesce(
                    Sum("quantity"),
                    0,
                )
            )["total"]

            revenue = items.aggregate(
                total=Coalesce(
                    Sum(
                        ExpressionWrapper(
                            F("quantity") * F("unit_price"),
                            output_field=DecimalField(
                                max_digits=16,
                                decimal_places=0,
                            ),
                        )
                    ),
                    0,
                    output_field=DecimalField(
                        max_digits=16,
                        decimal_places=0,
                    ),
                )
            )["total"]

            result.append(
                {
                    "province_id": province_id,
                    "province_name": province["province__name"],
                    "product_count": province["product_count"],
                    "sold_quantity": sold_quantity,
                    "revenue": revenue,
                }
            )

        result.sort(
            key=lambda item: item["revenue"],
            reverse=True,
        )

        return Response(
            ProvinceReportSerializer(
                result,
                many=True,
            ).data
        )


class FullReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()

        today_start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        week_start = today_start - timedelta(
            days=today_start.weekday()
        )

        month_start = today_start.replace(day=1)

        successful_payments = Payment.objects.filter(
            status=PaymentStatus.SUCCESS
        )

        paid_orders = Order.objects.filter(
            status__in=[
                OrderStatus.PAID,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
            ]
        )

        platform = {
            "total_orders": Order.objects.count(),

            "total_revenue": paid_orders.aggregate(
                total=Coalesce(
                    Sum("total_amount"),
                    0,
                    output_field=DecimalField(
                        max_digits=16,
                        decimal_places=0,
                    ),
                )
            )["total"],

            "total_sellers": User.objects.filter(
                role=UserRole.SELLER
            ).count(),

            "total_buyers": User.objects.filter(
                role=UserRole.BUYER
            ).count(),

            "total_products": Product.objects.count(),

            "approved_products": Product.objects.filter(
                is_approved=True
            ).count(),

            "pending_products": Product.objects.filter(
                is_approved=False,
                is_active=True,
            ).count(),

            "inactive_products": Product.objects.filter(
                is_active=False
            ).count(),

            "pending_orders": Order.objects.filter(
                status=OrderStatus.PENDING
            ).count(),

            "paid_orders": Order.objects.filter(
                status=OrderStatus.PAID
            ).count(),

            "shipped_orders": Order.objects.filter(
                status=OrderStatus.SHIPPED
            ).count(),

            "delivered_orders": Order.objects.filter(
                status=OrderStatus.DELIVERED
            ).count(),

            "cancelled_orders": Order.objects.filter(
                status=OrderStatus.CANCELLED
            ).count(),

            "successful_payments": successful_payments.count(),

            "pending_payments": Payment.objects.filter(
                status=PaymentStatus.PENDING
            ).count(),
        }

        def payment_sum(queryset):
            return queryset.aggregate(
                total=Coalesce(
                    Sum("amount"),
                    0,
                    output_field=DecimalField(
                        max_digits=16,
                        decimal_places=0,
                    ),
                )
            )["total"]

        sales = {
            "today": payment_sum(
                successful_payments.filter(
                    created_at__gte=today_start
                )
            ),

            "this_week": payment_sum(
                successful_payments.filter(
                    created_at__gte=week_start
                )
            ),

            "this_month": payment_sum(
                successful_payments.filter(
                    created_at__gte=month_start
                )
            ),

            "all_time": payment_sum(
                successful_payments
            ),
        }

        labels = {
            OrderStatus.PENDING: "در انتظار پرداخت",
            OrderStatus.PAID: "پرداخت شده",
            OrderStatus.SHIPPED: "ارسال شده",
            OrderStatus.DELIVERED: "تحویل شده",
            OrderStatus.CANCELLED: "لغو شده",
        }

        order_statuses = [
            {
                "status": status,
                "label": label,
                "count": Order.objects.filter(
                    status=status
                ).count(),
            }
            for status, label in labels.items()
        ]

        products = Product.objects.values(
            "province_id",
            "province__name",
        ).annotate(
            product_count=Count("id"),
        )

        provinces = []

        for province in products:
            province_id = province["province_id"]

            items = OrderItem.objects.filter(
                product__province_id=province_id,
                order__status__in=[
                    OrderStatus.PAID,
                    OrderStatus.SHIPPED,
                    OrderStatus.DELIVERED,
                ],
            )

            sold_quantity = items.aggregate(
                total=Coalesce(
                    Sum("quantity"),
                    0,
                )
            )["total"]

            revenue = items.aggregate(
                total=Coalesce(
                    Sum(
                        ExpressionWrapper(
                            F("quantity") * F("unit_price"),
                            output_field=DecimalField(
                                max_digits=16,
                                decimal_places=0,
                            ),
                        )
                    ),
                    0,
                    output_field=DecimalField(
                        max_digits=16,
                        decimal_places=0,
                    ),
                )
            )["total"]

            provinces.append(
                {
                    "province_id": province_id,
                    "province_name": province["province__name"],
                    "product_count": province["product_count"],
                    "sold_quantity": sold_quantity,
                    "revenue": revenue,
                }
            )

        provinces.sort(
            key=lambda item: item["revenue"],
            reverse=True,
        )

        data = {
            "platform": platform,
            "sales": sales,
            "order_statuses": order_statuses,
            "provinces": provinces,
        }

        return Response(
            FullReportSerializer(data).data
        )