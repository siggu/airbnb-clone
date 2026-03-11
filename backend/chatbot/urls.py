from django.urls import path
from . import views

urlpatterns = [
    path("", views.ChatView.as_view()),
    path("feedback/", views.ChatFeedbackView.as_view()),
]
