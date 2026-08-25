from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsBuyer
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer


class MyCartView(APIView):
    permission_classes = [IsBuyer]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(buyer=request.user)
        return Response(CartSerializer(cart).data)


class CartItemCreateView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsBuyer]

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(buyer=self.request.user)
        serializer.save(cart=cart)


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return CartItem.objects.filter(cart__buyer=self.request.user)
