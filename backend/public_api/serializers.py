from rest_framework import serializers
from tenants.models import UserCompany
from django.contrib.auth import get_user_model
from utils.functions import get_tenant
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class AppUserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCompany
        fields = [
            "company_schema_name",
            "first_name",
            "last_name",
            "phone",
            "birth_date",
            "last_login",
            "created_at",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        refresh = RefreshToken.for_user(instance.user_obj)
        access = refresh.access_token

        data["access"] = str(access)
        data["refresh"] = str(refresh)
        data["email"] = instance.user_email
        data["companies"] = []

        for uc in UserCompany.objects.filter(user_email=instance.user_email):
            if uc.id != instance.id:
                refresh = RefreshToken.for_user(uc.user_obj)
                access = refresh.access_token

            data["companies"].append({
                "id": uc.company_schema_name,
                "company_name": uc.get_company_name(),
                "base_url": uc.get_base_url(),
                "access": str(access),
                "refresh": str(refresh),
            })

        return data
