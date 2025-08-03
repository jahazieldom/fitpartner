app_name = "staff"

from django.urls import path
from . import views

urlpatterns = [
    path("instructors/", views.instructors, name="instructors"),
    path("instructor/", views.instructor, name="instructor"),
    path("instructor/<int:pk>/", views.instructor, name="instructor"),
    path("delete_instructor/<int:pk>/", views.delete_instructor, name="delete_instructor"),
]
