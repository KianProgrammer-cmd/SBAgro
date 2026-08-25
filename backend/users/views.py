from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core.throttling import RegisterRateThrottle, LoginRateThrottle
from core.turnstile import verify_turnstile

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterRateThrottle]
    throttle_scope = 'register'

    def create(self, request, *args, **kwargs):
        captcha_token = request.data.get('captcha_token')

        verify_turnstile(
            captcha_token,
            request.META.get('REMOTE_ADDR'),
        )

        return super().create(request, *args, **kwargs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        captcha_token = request.data.get('captcha_token')

        verify_turnstile(
            captcha_token,
            request.META.get('REMOTE_ADDR'),
        )

        return super().post(request, *args, **kwargs)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
