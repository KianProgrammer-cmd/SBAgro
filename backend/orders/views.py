from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.constants import OrderStatus
from core.permissions import IsBuyer, IsSeller
from cart.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer, SellerOrderSerializer

import hashlib
import secrets


# ============================================================
# Helpers
# ============================================================

def generate_delivery_code():
    """
    Generate a secure 6-digit delivery confirmation code.
    """
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_delivery_code(code: str) -> str:
    """
    Hash the delivery code before storing it in the database.
    """
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


# ============================================================
# Buyer - Orders
# ============================================================

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return (
            Order.objects
            .filter(buyer=self.request.user)
            .prefetch_related("items__product")
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        buyer = request.user

        cart = (
            Cart.objects
            .filter(buyer=buyer)
            .prefetch_related("items__product")
            .first()
        )

        if not cart or not cart.items.exists():
            raise ValidationError("سبد خرید خالی است.")

        cart_items = list(cart.items.all())

        # ----------------------------------------------------
        # Check stock before creating the order
        # ----------------------------------------------------

        for item in cart_items:
            if item.quantity > item.product.stock_quantity:
                raise ValidationError(
                    f'موجودی محصول «{item.product.title}» کافی نیست.'
                )

            if not item.product.is_active:
                raise ValidationError(
                    f'محصول «{item.product.title}» در حال حاضر فعال نیست.'
                )

            if not item.product.is_approved:
                raise ValidationError(
                    f'محصول «{item.product.title}» هنوز تأیید نشده است.'
                )

        # ----------------------------------------------------
        # Create order
        # ----------------------------------------------------

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        total = sum(
            item.subtotal
            for item in cart_items
        )

        order = serializer.save(
            buyer=buyer,
            total_amount=total,
        )

        # ----------------------------------------------------
        # Generate delivery confirmation code
        # ----------------------------------------------------

        delivery_code = generate_delivery_code()

        order.delivery_code_hash = hash_delivery_code(
            delivery_code
        )

        order.delivery_code_created_at = timezone.now()

        order.save(
            update_fields=[
                "delivery_code_hash",
                "delivery_code_created_at",
            ]
        )

        # ----------------------------------------------------
        # Create order items + decrease stock
        # ----------------------------------------------------

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                seller=item.product.seller,
                quantity=item.quantity,
                unit_price=item.product.price_per_unit,
            )

            item.product.stock_quantity -= item.quantity

            item.product.save(
                update_fields=["stock_quantity"]
            )

        # ----------------------------------------------------
        # Clear cart
        # ----------------------------------------------------

        cart.items.all().delete()

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        response_data = OrderSerializer(
            order,
            context={"request": request},
        ).data

        # مهم:
        # کد خام فقط همین‌جا به خریدار داده می‌شود.
        response_data["delivery_code"] = delivery_code

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# Buyer - Order Detail
# ============================================================

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return (
                Order.objects
                .all()
                .prefetch_related("items__product")
            )

        if user.role == "SELLER":
            return (
                Order.objects
                .filter(items__seller=user)
                .distinct()
                .prefetch_related("items__product")
            )

        return (
            Order.objects
            .filter(buyer=user)
            .prefetch_related("items__product")
        )


# ============================================================
# Seller - Orders
# ============================================================

class SellerOrderItemsView(generics.ListAPIView):
    """
    Orders containing products belonging to the logged-in seller.
    """

    permission_classes = [IsSeller]
    serializer_class = SellerOrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(items__seller=self.request.user)
            .distinct()
            .prefetch_related("items__product")
            .order_by("-created_at")
        )


# ============================================================
# Buyer - Confirm Delivery
# ============================================================

class ConfirmDeliveryView(APIView):
    """
    Buyer confirms that the shipment was received correctly.

    The buyer sends the 6-digit delivery code.

    The code itself is never stored in the database.
    Only its SHA-256 hash is stored.
    """

    permission_classes = [IsBuyer]

    @transaction.atomic
    def post(self, request, pk):

        code = str(
            request.data.get("delivery_code", "")
        ).strip()

        # ----------------------------------------------------
        # Validate code format
        # ----------------------------------------------------

        if not code:
            return Response(
                {
                    "detail": "کد تحویل را وارد کنید."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not code.isdigit() or len(code) != 6:
            return Response(
                {
                    "detail": "کد تحویل باید ۶ رقم باشد."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Lock order
        # ----------------------------------------------------

        try:
            order = (
                Order.objects
                .select_for_update()
                .get(
                    pk=pk,
                    buyer=request.user,
                )
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "detail": "سفارش پیدا نشد."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ----------------------------------------------------
        # Already delivered
        # ----------------------------------------------------

        if order.status == OrderStatus.DELIVERED:
            return Response(
                {
                    "detail": "این سفارش قبلاً تحویل تأیید شده است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Shipment must be shipped
        # ----------------------------------------------------

        if order.status != OrderStatus.SHIPPED:
            return Response(
                {
                    "detail": (
                        "تأیید تحویل فقط زمانی امکان‌پذیر است "
                        "که سفارش در وضعیت «در حال ارسال» باشد."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Check delivery code
        # ----------------------------------------------------

        if not order.delivery_code_hash:
            return Response(
                {
                    "detail": "کد تحویل برای این سفارش وجود ندارد."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        submitted_hash = hash_delivery_code(code)

        if not secrets.compare_digest(
            submitted_hash,
            order.delivery_code_hash,
        ):
            return Response(
                {
                    "detail": "کد تحویل اشتباه است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Confirm delivery
        # ----------------------------------------------------

        now = timezone.now()

        order.status = OrderStatus.DELIVERED
        order.delivered_at = now
        order.delivery_confirmed_by = request.user

        order.save(
            update_fields=[
                "status",
                "delivered_at",
                "delivery_confirmed_by",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "تحویل سفارش با موفقیت تأیید شد.",
                "order": OrderSerializer(
                    order,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )
class SellerOrderStatusUpdateView(APIView):
    """
    Seller can update the status of an order that contains
    at least one product belonging to the seller.

    Currently sellers are only allowed to mark a PAID order
    as SHIPPED.

    DELIVERED must be confirmed by the buyer using the
    delivery confirmation code.
    """

    permission_classes = [IsSeller]

    @transaction.atomic
    def patch(self, request, pk):
        new_status = str(
            request.data.get("status", "")
        ).strip().upper()

        # ----------------------------------------------------
        # Validate requested status
        # ----------------------------------------------------

        if not new_status:
            return Response(
                {
                    "detail": "وضعیت جدید را ارسال کنید."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status not in dict(OrderStatus.CHOICES):
            return Response(
                {
                    "detail": "وضعیت سفارش نامعتبر است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Get order belonging to seller
        # ----------------------------------------------------

        try:
            order = (
                Order.objects
                .select_for_update()
                .filter(
                    pk=pk,
                    items__seller=request.user,
                )
                .distinct()
                .first()
            )
        except Exception:
            order = None

        if not order:
            return Response(
                {
                    "detail": "سفارش پیدا نشد یا متعلق به این فروشنده نیست."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ----------------------------------------------------
        # Seller is not allowed to confirm delivery
        # ----------------------------------------------------

        if new_status == OrderStatus.DELIVERED:
            return Response(
                {
                    "detail": (
                        "تحویل سفارش فقط توسط خریدار و با کد تحویل "
                        "قابل تأیید است."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # Seller cannot cancel through this endpoint
        # ----------------------------------------------------

        if new_status == OrderStatus.CANCELLED:
            return Response(
                {
                    "detail": (
                        "لغو سفارش از طریق این endpoint برای فروشنده "
                        "امکان‌پذیر نیست."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # Current state
        # ----------------------------------------------------

        current_status = order.status

        # ----------------------------------------------------
        # PAID -> SHIPPED
        # ----------------------------------------------------

        if (
            current_status == OrderStatus.PAID
            and new_status == OrderStatus.SHIPPED
        ):
            order.status = OrderStatus.SHIPPED

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "detail": "وضعیت سفارش به «در حال ارسال» تغییر کرد.",
                    "order": OrderSerializer(
                        order,
                        context={"request": request},
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        # ----------------------------------------------------
        # Already shipped
        # ----------------------------------------------------

        if current_status == OrderStatus.SHIPPED:
            return Response(
                {
                    "detail": (
                        "این سفارش قبلاً به وضعیت «در حال ارسال» "
                        "تغییر کرده است."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Already delivered
        # ----------------------------------------------------

        if current_status == OrderStatus.DELIVERED:
            return Response(
                {
                    "detail": "این سفارش قبلاً تحویل شده است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Pending cannot directly become shipped
        # ----------------------------------------------------

        if current_status == OrderStatus.PENDING:
            return Response(
                {
                    "detail": (
                        "سفارش ابتدا باید پرداخت شود و سپس "
                        "به وضعیت «در حال ارسال» تغییر کند."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Invalid transition
        # ----------------------------------------------------

        return Response(
            {
                "detail": (
                    f"تغییر وضعیت از {current_status} "
                    f"به {new_status} مجاز نیست."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )