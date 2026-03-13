from django.db import models
from django.conf import settings


class ChatLog(models.Model):
    """유저별 대화 로그"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="chat_logs",
        verbose_name="유저",
    )
    session_id = models.CharField(max_length=100, verbose_name="세션 ID")
    role = models.CharField(
        max_length=10,
        choices=[("user", "유저"), ("assistant", "어시스턴트")],
        verbose_name="역할",
    )
    content = models.TextField(verbose_name="내용")
    cards = models.JSONField(default=list, blank=True, verbose_name="카드 데이터")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")

    class Meta:
        verbose_name = "대화 로그"
        verbose_name_plural = "대화 로그"
        ordering = ["-created_at"]

    def __str__(self):
        user_str = self.user.username if self.user else self.session_id
        return f"[{self.role}] {user_str} - {self.content[:30]}"


class ChatbotConfig(models.Model):
    """챗봇 설정 (단일 레코드)"""

    system_prompt = models.TextField(verbose_name="시스템 프롬프트")
    model_name = models.CharField(
        max_length=50,
        default="gpt-4o-mini",
        verbose_name="모델명",
    )
    is_active = models.BooleanField(default=True, verbose_name="활성화")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")

    class Meta:
        verbose_name = "챗봇 설정"
        verbose_name_plural = "챗봇 설정"

    def __str__(self):
        return f"{self.model_name} ({'활성' if self.is_active else '비활성'})"


class FAQ(models.Model):
    """자주 묻는 질문"""

    question = models.CharField(max_length=200, verbose_name="질문")
    answer = models.TextField(verbose_name="답변")
    is_active = models.BooleanField(default=True, verbose_name="활성화")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")

    class Meta:
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"
        ordering = ["question"]

    def __str__(self):
        return self.question


class BlockedKeyword(models.Model):
    """금지어"""

    keyword = models.CharField(max_length=100, unique=True, verbose_name="금지어")
    reason = models.CharField(max_length=200, blank=True, verbose_name="차단 사유")
    is_active = models.BooleanField(default=True, verbose_name="활성화")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")

    class Meta:
        verbose_name = "금지어"
        verbose_name_plural = "금지어"
        ordering = ["keyword"]

    def __str__(self):
        return self.keyword


class ChatFeedback(models.Model):
    """챗봇 답변 피드백"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="chat_feedbacks",
        verbose_name="유저",
    )
    session_id = models.CharField(max_length=100, verbose_name="세션 ID")
    user_message = models.TextField(verbose_name="유저 질문")
    assistant_message = models.TextField(verbose_name="챗봇 답변")
    is_positive = models.BooleanField(verbose_name="긍정 여부")
    comment = models.TextField(blank=True, verbose_name="추가 의견")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")

    class Meta:
        verbose_name = "피드백"
        verbose_name_plural = "피드백"
        ordering = ["-created_at"]

    def __str__(self):
        emoji = "👍" if self.is_positive else "👎"
        user_str = self.user.username if self.user else self.session_id
        return f"{emoji} {user_str} - {self.user_message[:30]}"
