from rest_framework import viewsets
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from clients.models import Client, ClientPlan
from plans.models import Plan
from .serializers import PlanSerializer, RegisterSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.urls import reverse
import stripe

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

    if current_plan and current_plan.is_active:
        return Response({
            "status": "error",
            "message": f"Ya se cuenta con el plan '{plan.name}' activo"
        }, status=status.HTTP_400_BAD_REQUEST) 

    price_id = plan.stripe_price_id
    success_url = reverse("payments:stripe_payment_success")
    cancel_url = reverse("payments:stripe_payment_cancel") 
    checkout_session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=request.build_absolute_uri(success_url),
        cancel_url=request.build_absolute_uri(cancel_url),
        metadata={
            "client_id": str(client_id),
            "plan_id": str(plan_id),
        },
    )

    # (opcional) guarda un registro inicial sin pago aún
    ClientPlan.objects.create(
        client_id=client_id,
        plan_id=plan_id,
        purchase_date=timezone.now(),
        stripe_session_id=checkout_session.id
    )

    return Response({"url": checkout_session.url})

@api_view(['GET'])
def user_info(request):
    pass
