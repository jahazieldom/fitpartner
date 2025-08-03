app_name = "payments"

from django.urls import path
from . import views

urlpatterns = [
    path("payments/", views.payments, name="payments"),
    path("payment/<int:pk>/", views.payment, name="payment"),
    path("stripe_payment/success/", views.stripe_payment_success, name="stripe_payment_success"),
    path("stripe_payment/cancel/", views.stripe_payment_cancel, name="stripe_payment_cancel"),
    path("stripe_webhook/", views.stripe_webhook, name="stripe_webhook"),
]
