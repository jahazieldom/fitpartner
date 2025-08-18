"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('', include('core.urls')),
    path("activities/", include("activities.urls", namespace="activities")),
    path("staff/", include("staff.urls", namespace="staff")),
    path("clients/", include("clients.urls", namespace="clients")),
    path("plans/", include("plans.urls", namespace="plans")),
    path("payments/", include("payments.urls", namespace="payments")),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # path('sh/', include('sh.urls')),
]
