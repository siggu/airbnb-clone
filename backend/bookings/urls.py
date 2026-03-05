from django.urls import path
from . import views

urlpatterns = [
    path("", views.MyBookings.as_view()),
    path("<int:pk>/", views.BookingDetail.as_view()),
]
