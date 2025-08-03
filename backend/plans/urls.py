app_name = "plans"

from django.urls import path
from . import views

urlpatterns = [
    path("plans/", views.plans, name="plans"),
    path("plan/", views.plan, name="plan"),
    path("plan/<int:pk>/", views.plan, name="plan"),
    path("delete_plan/<int:pk>/", views.delete_plan, name="delete_plan"),
]
