from rest_framework import viewsets
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from clients.models import Client, ClientPlan
from plans.models import Plan
from core.models import CompanySettings
from activities.models import ActivityTemplate, ActivitySession
from .serializers import (
    PlanSerializer, 
    RegisterSerializer, 
    ActivityTemplateSerializer, 
    ActivityFilterSerializer,
    ActivitySessionSerializer,
)
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.urls import reverse
import stripe
from api.pagination import CustomLimitOffsetPagination


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

class RegisterView(generics.CreateAPIView):
    queryset = Client.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []

@api_view(['POST'])
def create_checkout_link(request):
    if not request.tenant.settings.stripe_enabled:
        return Response({"status": "error", "message": "Pasarela de pagos inactiva"})

    stripe.api_key = request.tenant.settings.stripe_secret_key
    plan_id = request.data["plan_id"]
    client_id = request.user.client.id
    plan = Plan.objects.get(id=plan_id)
    current_plan = request.user.client.current_plan

    if current_plan:
        if current_plan.is_active:
            return Response({
                "status": "error",
                "message": f"Ya se cuenta con el plan '{plan.name}' activo"
            }, status=status.HTTP_400_BAD_REQUEST) 
        
    if not current_plan or current_plan.plan_id != plan_id:
        current_plan = ClientPlan.objects.create(
            is_active=False,
            client_id=client_id,
            plan_id=plan_id,
            purchase_date=timezone.now(),
        )

    if not current_plan.stripe_session_id:
        price_id = plan.stripe_price_id
        success_url = reverse("payments:stripe_payment_success")
        cancel_url = reverse("payments:stripe_payment_cancel") 
        checkout_session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=request.build_absolute_uri(success_url) + f"?_p={current_plan.id}",
            cancel_url=request.build_absolute_uri(cancel_url) + f"?_p={current_plan.id}",
            metadata={
                "client_id": str(client_id),
                "plan_id": str(plan_id),
            },
        )
        current_plan.stripe_session_id = checkout_session.id
        current_plan.save()
    
    checkout_session = stripe.checkout.Session.retrieve(current_plan.stripe_session_id)
    checkout_url = checkout_session.url

    return Response({"url": checkout_url})

@api_view(['GET'])
def company_info(request):
    conf = CompanySettings.objects.first()
    info = {
        "name": conf.name,
        "full_address": conf.full_address,
        "contact_name": conf.contact_name,
        "contact_email": conf.contact_email,
        "contact_phone": conf.contact_phone,
        "lat": conf.lat,
        "lng": conf.lng,
        "stripe_enabled": conf.stripe_enabled,
    }
    return Response(info) 

@api_view(['GET'])
def user_dashboard(request):
    conf = CompanySettings.objects.first()

    current_plan = request.user.client.current_plan
    plans = []

    for plan in Plan.objects.all():
        plans.append(PlanSerializer(plan).data)

    if current_plan:
        current_plan = {
            "name": current_plan.plan.name,
            "purchase_date": current_plan.purchase_date.isoformat() if current_plan.purchase_date else None,
            "first_use_date": current_plan.first_use_date.isoformat() if current_plan.first_use_date else None,
            "is_active": current_plan.is_active,
            "remaining_sessions": current_plan.remaining_sessions,
            "expiration_date": current_plan.expiration_date,
            "plan_expiry_description": current_plan.plan_expiry_description(),
            "expiration_label": current_plan.plan.expiration_label(),
        }

    company_info = {
        "name": conf.name,
        "full_address": conf.full_address,
        "contact_name": conf.contact_name,
        "contact_email": conf.contact_email,
        "contact_phone": conf.contact_phone,
        "lat": conf.lat,
        "lng": conf.lng,
        "stripe_enabled": conf.stripe_enabled,
    }

    return Response({
        "company_info": company_info,
        "current_plan": current_plan,
        "plans": plans
    })

def paginated_queryset(queryset, *, serializer, request):
    paginator = CustomLimitOffsetPagination()
    paginated_qs = paginator.paginate_queryset(queryset, request)
    _serializer = serializer(paginated_qs, many=True)

    return paginator.get_paginated_response(_serializer.data)

@api_view(['GET'])
def classes(request):
    objects = ActivityTemplate.objects.filter(is_active=True).order_by("name").distinct("name")
    return paginated_queryset(objects, serializer=ActivityTemplateSerializer, request=request)


@api_view(['GET'])
def reservations(request):
    filter_ser = ActivityFilterSerializer(data=request.data)

    if filter_ser.is_valid():
        date = filter_ser.validated_data.get("date")
        class_name = filter_ser.validated_data.get("class_name")

        sessions = ActivitySession.objects.prefetch_related("template").filter(
            template__is_active=True
        ).order_by("start_time")

        classes_qs = ActivityTemplate.objects.filter(is_active=True).order_by("name").distinct("name")

        if date:
            sessions = sessions.filter(date=date)

        if class_name:
            sessions = sessions.filter(template__name=class_name)

        sessions_data = ActivitySessionSerializer(sessions, many=True).data
        classes_data = ActivityTemplateSerializer(classes_qs, many=True).data

        return Response({
            "status": "success",
            "classes": classes_data,
            "sessions": sessions_data
        })

    return Response(filter_ser.errors, status=status.HTTP_400_BAD_REQUEST)
