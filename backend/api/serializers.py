from plans.models import Plan
from clients.models import Client
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model
from tenants.models import UserCompany
from utils.functions import get_tenant

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Client
        fields = [
            'email', 'password',
            'first_name', 'last_name', 'phone', 'birth_date', 'source'
        ]

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este email.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        client = Client.objects.create(user=user, email=email, **validated_data)
        UserCompany.objects.create(
            user_email=email,
            password=user.password,
            first_name=client.first_name,
            last_name=client.last_name,
            phone=client.phone,
            birth_date=client.birth_date,
            company_schema_name=get_tenant().schema_name
        )
        return client


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'
