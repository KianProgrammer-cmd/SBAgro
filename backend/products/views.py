from rest_framework import generics, permissions
from core.permissions import IsSeller
from .models import Product, ProductCategory
from .serializers import ProductSerializer, ProductCategorySerializer
from .filters import ProductFilter
from .permissions import IsProductOwnerOrReadOnly


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    filterset_class = ProductFilter

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSeller()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        if not (self.request.user.is_authenticated and self.request.user.role == 'ADMIN'):
            qs = qs.filter(is_approved=True)
        return qs


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsProductOwnerOrReadOnly]


class MyProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)


class CategoryListView(generics.ListAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]
