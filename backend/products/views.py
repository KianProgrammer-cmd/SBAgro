from rest_framework import generics, permissions, status
from rest_framework.response import Response

from core.permissions import IsSeller, IsAdmin

from .models import Product, ProductCategory
from .serializers import ProductSerializer, ProductCategorySerializer
from .filters import ProductFilter
from .permissions import IsProductOwnerOrReadOnly

from notifications.models import Notification


# =========================================================
# PRODUCT LIST / CREATE
# =========================================================

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    filterset_class = ProductFilter

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSeller()]

        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)

        # محصولات عمومی فقط اگر تأیید شده باشند
        if not (
            self.request.user.is_authenticated
            and self.request.user.role == "ADMIN"
        ):
            qs = qs.filter(is_approved=True)

        return qs

    def perform_create(self, serializer):
        # seller داخل ProductSerializer.create() تعیین می‌شود
        # بنابراین اینجا دوباره seller ارسال نمی‌کنیم.
        serializer.save(
            is_approved=False,
            is_active=False,
        )


# =========================================================
# PRODUCT DETAIL
# =========================================================

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsProductOwnerOrReadOnly]

    def perform_update(self, serializer):
        # اگر فروشنده محصول را ویرایش کند،
        # محصول دوباره باید توسط ادمین بررسی شود.
        serializer.save(
            is_approved=False,
            is_active=False,
        )


# =========================================================
# MY PRODUCTS
# =========================================================

class MyProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        return Product.objects.filter(
            seller=self.request.user
        ).order_by("-created_at")


# =========================================================
# CATEGORIES
# =========================================================

class CategoryListView(generics.ListAPIView):
    queryset = ProductCategory.objects.all().order_by("id")
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]


# =========================================================
# ADMIN PRODUCT MANAGEMENT
# =========================================================

class AdminProductListView(generics.ListAPIView):
    """
    دریافت تمام محصولات برای پنل مدیریت.
    فقط ADMIN.
    """

    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Product.objects.all().order_by("-created_at")


# =========================================================
# ADMIN APPROVE
# =========================================================

class AdminApproveProductView(generics.UpdateAPIView):
    """
    تأیید محصول توسط مدیر.
    """

    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]
    queryset = Product.objects.all()

    def update(self, request, *args, **kwargs):
        product = self.get_object()

        product.is_approved = True
        product.is_active = True

        # اگر قبلاً رد شده بود، دلیل رد را پاک می‌کنیم.
        if hasattr(product, "rejection_reason"):
            product.rejection_reason = ""

        update_fields = [
            "is_approved",
            "is_active",
            "updated_at",
        ]

        if hasattr(product, "rejection_reason"):
            update_fields.append("rejection_reason")

        product.save(update_fields=update_fields)

        # ارسال اعلان برای فروشنده
        Notification.objects.create(
            user=product.seller,
            title="محصول شما تأیید شد ✅",
            message=(
                f'محصول «{product.title}» توسط مدیریت تأیید شد '
                "و اکنون در فروشگاه قابل نمایش است."
            ),
        )

        return Response(
            ProductSerializer(
                product,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


# =========================================================
# ADMIN REJECT
# =========================================================

class AdminRejectProductView(generics.UpdateAPIView):
    """
    رد محصول توسط مدیر همراه با دلیل.
    """

    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]
    queryset = Product.objects.all()

    def update(self, request, *args, **kwargs):
        product = self.get_object()

        reason = str(
            request.data.get("reason", "")
        ).strip()

        # دلیل رد الزامی است
        if not reason:
            return Response(
                {
                    "detail": "دلیل رد محصول الزامی است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.is_approved = False
        product.is_active = False

        # ذخیره دلیل رد داخل خود محصول
        update_fields = [
            "is_approved",
            "is_active",
            "updated_at",
        ]

        if hasattr(product, "rejection_reason"):
            product.rejection_reason = reason
            update_fields.append("rejection_reason")

        product.save(update_fields=update_fields)

        # ارسال دلیل رد برای فروشنده
        Notification.objects.create(
            user=product.seller,
            title="محصول شما رد شد ❌",
            message=(
                f'محصول «{product.title}» توسط مدیریت رد شد.\n\n'
                f"دلیل رد:\n{reason}"
            ),
        )

        return Response(
            {
                "message": "محصول با موفقیت رد شد.",
                "reason": reason,
                "product": ProductSerializer(
                    product,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# ADMIN DELETE
# =========================================================

class AdminDeleteProductView(generics.DestroyAPIView):
    """
    حذف محصول توسط مدیر.
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdmin]

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()

        product_title = product.title
        seller = product.seller

        # حذف محصول
        product.delete()

        # ارسال اعلان برای فروشنده
        Notification.objects.create(
            user=seller,
            title="محصول حذف شد 🗑️",
            message=(
                f'محصول «{product_title}» توسط مدیریت '
                "از سامانه حذف شد."
            ),
        )

        return Response(
            {
                "message": "محصول با موفقیت حذف شد."
            },
            status=status.HTTP_200_OK,
        )