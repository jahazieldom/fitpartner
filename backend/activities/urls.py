app_name = "activities"

from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path("activities/", views.activities, name="activities"),
    path("activity/", views.activity, name="activity"),
    path("activity/<int:pk>/", views.activity, name="activity"),
    path("get_activity_session_form/<int:activity_template_id>/", views.get_activity_session_form, name="get_activity_session_form"),
    path("delete_activity/<int:pk>/", views.delete_activity, name="delete_activity"),
    path("api/calendario/", views.calendar_events, name="calendar_events"),
]
