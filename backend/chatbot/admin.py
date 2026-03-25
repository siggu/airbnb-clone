from django.contrib import admin
from .models import ChatbotConfig, FAQ, BlockedKeyword, ChatLog, ChatFeedback


@admin.register(ChatbotConfig)
class ChatbotConfigAdmin(admin.ModelAdmin):
    list_display = ["model_name", "is_active", "created_at"]
    list_editable = ["is_active"]


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ["question", "is_active", "order"]
    list_editable = ["is_active", "order"]


@admin.register(BlockedKeyword)
class BlockedKeywordAdmin(admin.ModelAdmin):
    list_display = ["keyword", "is_active"]
    list_editable = ["is_active"]


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ["session_key", "user", "message", "model_used", "response_time_ms", "created_at"]
    readonly_fields = [
        "session_key", "user", "message", "reply",
        "model_used", "tools_used", "response_time_ms",
    ]
    search_fields = ["session_key", "message"]


@admin.register(ChatFeedback)
class ChatFeedbackAdmin(admin.ModelAdmin):
    list_display = ["chat_log", "rating", "comment", "created_at"]
