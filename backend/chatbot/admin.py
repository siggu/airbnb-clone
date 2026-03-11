from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import ChatLog, ChatbotConfig, FAQ, BlockedKeyword, ChatFeedback


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "session_id", "role_badge", "short_content")
    list_filter = ("role", "created_at", "user")
    search_fields = ("user__username", "session_id", "content")
    readonly_fields = ("user", "session_id", "role", "content", "cards_view", "created_at", "conversation_view")
    ordering = ("-created_at",)
    fields = ("user", "session_id", "role", "created_at", "content", "cards_view", "conversation_view")

    @admin.display(description="역할")
    def role_badge(self, obj):
        if obj.role == "user":
            return format_html('<span style="background:#3b82f6;color:white;padding:2px 8px;border-radius:10px;font-size:11px;white-space:nowrap;">유저</span>')
        return format_html('<span style="background:#10b981;color:white;padding:2px 8px;border-radius:10px;font-size:11px;white-space:nowrap;">챗봇</span>')

    @admin.display(description="내용")
    def short_content(self, obj):
        return obj.content[:60] + "..." if len(obj.content) > 60 else obj.content

    @admin.display(description="카드 데이터")
    def cards_view(self, obj):
        if not obj.cards:
            return "-"
        html = ['<div style="display:flex;flex-wrap:wrap;gap:12px;">']
        for card in obj.cards:
            thumb = card.get("thumbnail_url", "")
            img = f'<img src="{thumb}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">' if thumb else ""
            label = "숙소" if card.get("type") == "room" else "체험"
            html.append(
                f'<div style="width:180px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">'
                f'{img}'
                f'<div style="padding:8px;">'
                f'<div style="font-size:11px;color:#6b7280;">{label} #{card.get("pk")}</div>'
                f'<div style="font-weight:bold;font-size:13px;margin:2px 0;">{card.get("name","")}</div>'
                f'<div style="font-size:12px;color:#6b7280;">{card.get("city","")} · ₩{card.get("price",0):,}</div>'
                f'<div style="font-size:12px;color:#f59e0b;">★ {card.get("rating") or "-"}</div>'
                f'</div></div>'
            )
        html.append('</div>')
        return mark_safe("".join(html))

    @admin.display(description="대화 전체 보기")
    def conversation_view(self, obj):
        logs = ChatLog.objects.filter(session_id=obj.session_id).order_by("created_at")
        html = ['<div style="max-width:700px;font-family:sans-serif;">']
        for log in logs:
            if log.role == "user":
                html.append(
                    f'<div style="text-align:right;margin:8px 0;">'
                    f'<span style="display:inline-block;background:#3b82f6;color:white;'
                    f'padding:8px 14px;border-radius:18px 18px 4px 18px;max-width:80%;'
                    f'word-break:break-word;white-space:pre-wrap;">{log.content}</span>'
                    f'<div style="font-size:11px;color:#9ca3af;margin-top:2px;">'
                    f'{log.created_at.strftime("%Y-%m-%d %H:%M")}</div></div>'
                )
            else:
                # 첫 줄 텍스트만 추출 (마크다운 제외)
                first_line = log.content.split("\n")[0].strip()

                # cards 데이터로 이미지 카드 렌더링
                cards_html = ""
                if log.cards:
                    cards_html = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">'
                    for card in log.cards:
                        thumb = card.get("thumbnail_url", "")
                        name = card.get("name", "")
                        city = card.get("city", "")
                        price = card.get("price", 0)
                        rating = card.get("rating") or "-"
                        pk = card.get("pk")
                        kind = card.get("type", "room")
                        path = "rooms" if kind == "room" else "experiences"
                        img = f'<img src="{thumb}" style="width:100%;height:90px;object-fit:cover;border-radius:6px 6px 0 0;">' if thumb else ""
                        cards_html += (
                            f'<a href="http://127.0.0.1:3000/{path}/{pk}" target="_blank" '
                            f'style="width:140px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;text-decoration:none;color:inherit;display:block;">'
                            f'{img}'
                            f'<div style="padding:6px;font-size:11px;">'
                            f'<div style="font-weight:bold;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">{name}</div>'
                            f'<div style="color:#6b7280;">{city} · ₩{price:,}</div>'
                            f'<div style="color:#f59e0b;">⭐ {rating}</div>'
                            f'</div></a>'
                        )
                    cards_html += '</div>'

                html.append(
                    f'<div style="text-align:left;margin:8px 0;">'
                    f'<div style="display:inline-block;background:#f3f4f6;color:#111827;'
                    f'padding:8px 14px;border-radius:18px 18px 18px 4px;max-width:80%;'
                    f'word-break:break-word;">'
                    f'<div>{first_line}</div>'
                    f'{cards_html}</div>'
                    f'<div style="font-size:11px;color:#9ca3af;margin-top:2px;">'
                    f'{log.created_at.strftime("%Y-%m-%d %H:%M")}</div></div>'
                )
        html.append('</div>')
        return mark_safe("".join(html))

    def has_add_permission(self, request):
        return False


@admin.register(ChatbotConfig)
class ChatbotConfigAdmin(admin.ModelAdmin):
    list_display = ("model_name", "is_active", "updated_at")
    list_editable = ("is_active",)

    def has_add_permission(self, request):
        if ChatbotConfig.objects.exists():
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "is_active", "created_at")
    list_editable = ("is_active",)
    search_fields = ("question", "answer")
    list_filter = ("is_active",)


@admin.register(BlockedKeyword)
class BlockedKeywordAdmin(admin.ModelAdmin):
    list_display = ("keyword", "reason", "is_active", "created_at")
    list_editable = ("is_active",)
    search_fields = ("keyword", "reason")
    list_filter = ("is_active",)


@admin.register(ChatFeedback)
class ChatFeedbackAdmin(admin.ModelAdmin):
    list_display = ("created_at", "feedback_badge", "user", "session_id", "short_question")
    list_filter = ("is_positive", "created_at")
    search_fields = ("user__username", "session_id", "user_message", "comment")
    readonly_fields = ("user", "session_id", "user_message", "assistant_message", "is_positive", "comment", "created_at")
    ordering = ("-created_at",)

    @admin.display(description="평가")
    def feedback_badge(self, obj):
        if obj.is_positive:
            return format_html('<span style="font-size:18px;">👍</span>')
        return format_html('<span style="font-size:18px;">👎</span>')

    @admin.display(description="유저 질문")
    def short_question(self, obj):
        return obj.user_message[:60] + "..." if len(obj.user_message) > 60 else obj.user_message

    def has_add_permission(self, request):
        return False
