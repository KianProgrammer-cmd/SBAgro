from django.conf import settings
from django.db import models


class ProductCategory(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="نام دسته‌بندی",
    )

    class Meta:
        db_table = "product_categories"
        verbose_name = "دسته‌بندی محصول"
        verbose_name_plural = "دسته‌بندی‌های محصولات"

    def __str__(self):
        return self.name


class Product(models.Model):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="products",
        on_delete=models.CASCADE,
        verbose_name="فروشنده",
    )

    category = models.ForeignKey(
        ProductCategory,
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="دسته‌بندی",
    )

    title = models.CharField(
        max_length=150,
        verbose_name="عنوان محصول",
    )

    description = models.TextField(
        blank=True,
        verbose_name="توضیحات",
    )

    image = models.ImageField(
        upload_to="products/",
        verbose_name="تصویر محصول",
    )

    price_per_unit = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        verbose_name="قیمت هر واحد",
        help_text="قیمت به تومان",
    )

    unit = models.CharField(
        max_length=20,
        default="kg",
        verbose_name="واحد",
        help_text="مثلاً: کیلوگرم، تن، عدد",
    )

    stock_quantity = models.PositiveIntegerField(
        default=0,
        verbose_name="موجودی",
    )

    province = models.ForeignKey(
        "locations.Province",
        on_delete=models.PROTECT,
        verbose_name="استان",
    )

    city = models.ForeignKey(
        "locations.City",
        on_delete=models.PROTECT,
        verbose_name="شهر",
    )

    is_approved = models.BooleanField(
        default=False,
        verbose_name="تأیید شده",
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="فعال",
    )

    # -----------------------------
    # اطلاعات رد محصول
    # -----------------------------

    rejection_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="دلیل رد محصول",
    )

    rejected_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="تاریخ رد",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="تاریخ ایجاد",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="آخرین بروزرسانی",
    )

    class Meta:
        db_table = "products"

        verbose_name = "محصول"
        verbose_name_plural = "محصولات"

        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["province", "city"]),
            models.Index(fields=["is_approved", "is_active"]),
        ]

    def __str__(self):
        return self.title