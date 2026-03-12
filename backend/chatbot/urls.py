from django.urls import path
from . import views

urlpatterns = [
    path("", views.ChatView.as_view()),
    path("stream/", views.ChatStreamView.as_view()),
    path("status/", views.ChatStatusView.as_view()),
    path("feedback/", views.ChatFeedbackView.as_view()),
]
