from django.contrib import admin
from .models import Product, ProductCategory

admin.site.register(ProductCategory)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'price_per_unit', 'is_approved', 'is_active')
    list_filter = ('is_approved', 'is_active', 'province')
    actions = ['approve_products']

    def approve_products(self, request, queryset):
        queryset.update(is_approved=True)
    approve_products.short_description = 'تایید محصولات انتخاب‌شده'
