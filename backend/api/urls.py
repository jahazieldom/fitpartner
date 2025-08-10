from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


# Importa tus viewsets aquí
# from api.views.auth import RegisterView, LoginView, LogoutView, ProfileView
# from api.views.plans import PlanViewSet
# from api.views.classes import ClassViewSet
# from api.views.messages import MessageViewSet

router = DefaultRouter()
router.register(r'plans', views.PlanViewSet, basename='plan')
# router.register(r'classes', ClassViewSet, basename='class')
# router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create_checkout_link/', views.create_checkout_link, name='create_checkout_link'),
    path('user/dashboard/', views.user_dashboard, name='user_dashboard'),
    path('company_info/', views.company_info, name='company_info'),
    path('classes/', views.classes, name='classes'),

    # Rutas automáticas de los routers (planes, clases, mensajes, etc.)
    path('', include(router.urls)),
]
