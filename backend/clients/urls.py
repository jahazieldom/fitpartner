app_name = "clients"

from django.urls import path
from . import views

urlpatterns = [
    path("clients/", views.clients, name="clients"),
    path("client/", views.client, name="client"),
    path("client/<int:pk>/", views.client, name="client"),
    path("delete_client/<int:pk>/", views.delete_client, name="delete_client"),
    path("save_client_plan_payment/<int:client_plan_pk>/", views.save_client_plan_payment, name="save_client_plan_payment"),
    path("get_client_plan_payment_form/<int:client_plan_pk>/", views.get_client_plan_payment_form, name="get_client_plan_payment_form"),
]
