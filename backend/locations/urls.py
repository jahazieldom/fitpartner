app_name = "locations"

from django.urls import path
from . import views

urlpatterns = [
    path("locations/", views.locations, name="locations"),
    path("location/", views.location, name="location"),
    path("location/<int:pk>/", views.location, name="location"),
    path("delete_location/<int:pk>/", views.delete_location, name="delete_location"),
]
