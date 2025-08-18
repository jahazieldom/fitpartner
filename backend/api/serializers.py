from plans.models import Plan
from clients.models import Client, ClientPlan
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model
from tenants.models import UserCompany
from utils.functions import get_tenant
from activities.models import ActivityTemplate, ActivitySession, Reservation

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
    expiration_label = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = '__all__'

    def get_expiration_label(self, obj):
        return obj.expiration_label()

class ActivityTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityTemplate
        fields = [
            "id",
            "name",
            "description",
            "instructor",
            "weekdays",
            "start_time",
            "duration_minutes",
            "capacity",
            "start_date",
            "end_date",
            "color_rgb",
        ]

class ActivityFilterSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    class_name = serializers.CharField(required=False)

class ActivitySessionSerializer(serializers.ModelSerializer):
    attendees = serializers.SerializerMethodField()

    class Meta:
        model = ActivitySession
        fields = [
            "id",
            "date",
            "start_time",
            "capacity",
            "is_cancelled",
            "attendees",
        ]
    
    def get_attendees(self, obj):
        import random

        return random.randint(0, obj.capacity)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["duration_minutes"] = instance.template.duration_minutes

        data["category"] = {
            "name": instance.template.name,
            "color_rgb": instance.template.color_rgb,
        }
        return data

class ClientPlanSerializer(serializers.ModelSerializer):
    plan_expiry_description = serializers.SerializerMethodField()
    expiration_label = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    access_type = serializers.SerializerMethodField()
    access_value = serializers.SerializerMethodField()

    class Meta:
        model = ClientPlan
        fields = [
            "name",
            "purchase_date",
            "first_use_date",
            "is_active",
            "remaining_sessions",
            "expiration_date",
            "plan_expiry_description",
            "expiration_label",
            "access_type",
            "access_value",
        ]
    
    def get_access_type(self, instance):
        return instance.plan.access_type

    def get_access_value(self, instance):
        return instance.plan.access_value

    def get_name(self, instance):
        return instance.plan.name

    def get_plan_expiry_description(self, instance):
        return instance.plan_expiry_description()
    
    def get_expiration_label(self, instance):
        return instance.plan.expiration_label()

class ReservationSerializer(serializers.ModelSerializer):
    # session = ActivitySessionSerializer()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            "id",
            "session",
            "date",
            "reserved_at",
        ]
    
    def get_date(self, instance):
        return instance.session.date
