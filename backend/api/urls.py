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
router.register(r'push_tokens', views.ClientPushTokenViewSet, basename='push_tokens')
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
    path('reservations/', views.reservations, name='reservations'),
    path('reservations/<int:id>/check_in/', views.reservation_check_in, name='reservation_check_in'),
    path('reservations/<int:id>/cancel/', views.reservation_cancel, name='reservation_cancel'),
    path('account/reservations/', views.account_reservations, name='account_reservations'),
    path('sessions/<int:activity_session_id>/book/', views.activity_session_book, name='activity_session_book'),
    path('sessions/<int:activity_session_id>/waitlist/', views.activity_session_waitlist, name='activity_session_waitlist'),

    # Rutas automáticas de los routers (planes, clases, mensajes, etc.)
    path('', include(router.urls)),
]
