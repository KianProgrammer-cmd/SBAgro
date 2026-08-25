from django.contrib.auth import password_validation
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'mobile',
            'password',
            'role',
            'province',
            'city',
        )

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate_role(self, value):
        if value not in ('SELLER', 'BUYER'):
            raise serializers.ValidationError('نقش نامعتبر است.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'mobile',
            'role',
            'province',
            'city',
            'is_mobile_verified',
        )
        read_only_fields = (
            'role',
            'is_mobile_verified',
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['username'] = user.username

        return token
