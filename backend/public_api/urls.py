from django.urls import path
from . import views 

urlpatterns = [
    path("register/", views.RegisterUserCompany.as_view()),
    path("login/", views.LoginUserCompany.as_view()),
    path("validate_email/", views.validate_email),
]
