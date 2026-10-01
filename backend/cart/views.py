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

    def create(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(
            buyer=self.request.user
        )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)

        # Check if product is already in cart
        cart_item = CartItem.objects.filter(
            cart=cart,
            product=product,
        ).first()

        if cart_item:
            new_quantity = cart_item.quantity + quantity

            if new_quantity > product.stock_quantity:
                return Response(
                    {
                        "detail": (
                            f"موجودی کافی نیست. "
                            f"حداکثر {product.stock_quantity} عدد موجود است."
                        )
                    },
                    status=400,
                )

            cart_item.quantity = new_quantity
            cart_item.save(update_fields=["quantity"])

            return Response(
                CartItemSerializer(cart_item).data,
                status=200,
            )

        # Product is not already in cart
        if quantity > product.stock_quantity:
            return Response(
                {
                    "detail": (
                        f"موجودی کافی نیست. "
                        f"حداکثر {product.stock_quantity} عدد موجود است."
                    )
                },
                status=400,
            )

        cart_item = CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=quantity,
        )

        return Response(
            CartItemSerializer(cart_item).data,
            status=201,
        )


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__buyer=self.request.user
        )