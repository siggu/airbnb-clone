from django.db import models
from common.models import CommonModel


class ChatbotConfig(CommonModel):
    """Admin에서 모델명 등 설정 관리"""

    model_name = models.CharField(max_length=100, default="claude-sonnet-4-6")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "챗봇 설정"
        verbose_name_plural = "챗봇 설정"

    def __str__(self):
        return f"{self.model_name} ({'활성' if self.is_active else '비활성'})"


class FAQ(CommonModel):
    """시스템 프롬프트에 주입되는 FAQ"""

    question = models.TextField()
    answer = models.TextField()
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"
        ordering = ["order"]

    def __str__(self):
        return self.question[:50]


class BlockedKeyword(CommonModel):
    """요청 전 금지어 검사"""

    keyword = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "금지 키워드"
        verbose_name_plural = "금지 키워드"

    def __str__(self):
        return self.keyword


class ChatLog(CommonModel):
    """대화 로그"""

    session_key = models.CharField(max_length=100, db_index=True)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chat_logs",
    )
    message = models.TextField()
    reply = models.TextField()
    model_used = models.CharField(max_length=100, blank=True)
    tools_used = models.JSONField(default=list)
    response_time_ms = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "대화 로그"
        verbose_name_plural = "대화 로그"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.session_key} - {self.message[:30]}"


class ChatFeedback(CommonModel):
    """답변 피드백"""

    RATING_CHOICES = [(1, "나쁨"), (2, "보통"), (3, "좋음")]

    chat_log = models.ForeignKey(
        ChatLog,
        on_delete=models.CASCADE,
        related_name="feedbacks",
    )
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)

    class Meta:
        verbose_name = "챗봇 피드백"
        verbose_name_plural = "챗봇 피드백"

    def __str__(self):
        return f"{self.chat_log.session_key} - {self.rating}"
