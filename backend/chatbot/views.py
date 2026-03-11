import asyncio
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from config.authentication import CsrfExemptSessionAuthentication, JWTAuthentication
from agents import Runner
from .agents.agent import chat_agent
from .agents.session import get_session_history, save_session_history, clear_session_history
from .models import ChatLog, ChatFeedback, BlockedKeyword, FAQ


def _get_session_id(request):
    if request.user.is_authenticated:
        return f"user_{request.user.pk}"
    if not request.session.session_key:
        request.session.create()
    return f"anon_{request.session.session_key}"


def _check_blocked(message: str) -> str | None:
    """금지어가 포함되어 있으면 금지어를 반환, 없으면 None"""
    keywords = BlockedKeyword.objects.filter(is_active=True).values_list("keyword", flat=True)
    for kw in keywords:
        if kw.lower() in message.lower():
            return kw
    return None


def _get_faq_context() -> str:
    """활성화된 FAQ를 시스템 프롬프트에 추가할 텍스트로 반환"""
    faqs = FAQ.objects.filter(is_active=True)
    if not faqs.exists():
        return ""
    lines = ["\n\n## 자주 묻는 질문 (FAQ)"]
    for faq in faqs:
        lines.append(f"Q: {faq.question}\nA: {faq.answer}")
    return "\n".join(lines)


class ChatView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication, JWTAuthentication]
    permission_classes = [AllowAny]

    def _get_token(self, user) -> str:
        token, _ = Token.objects.get_or_create(user=user)
        return token.key

    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response({"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 금지어 확인
        blocked = _check_blocked(message)
        if blocked:
            return Response(
                {"error": f"해당 메시지는 전송할 수 없습니다. (금지어: {blocked})"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_id = _get_session_id(request)
        user = request.user if request.user.is_authenticated else None

        agent_context = {
            "token": self._get_token(request.user) if request.user.is_authenticated else None,
            "user": request.user.username if request.user.is_authenticated else None,
            "is_logged_in": request.user.is_authenticated,
        }

        history = get_session_history(session_id)
        history.append({"role": "user", "content": message})

        # FAQ 컨텍스트를 히스토리 앞에 system 메시지로 주입
        faq_context = _get_faq_context()
        input_with_faq: list = list(history)
        if faq_context:
            input_with_faq = [{"role": "system", "content": faq_context}] + input_with_faq

        try:
            result = asyncio.run(
                Runner.run(
                    chat_agent,
                    input=input_with_faq,
                    context=agent_context,
                )
            )
            output = result.final_output
            # 디버그: 에이전트가 호출한 도구 목록 로깅
            import logging
            logger = logging.getLogger(__name__)
            for item in result.new_items:
                logger.warning(f"[AGENT ITEM] type={type(item).__name__} data={str(item)[:200]}")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        reply = output.reply
        cards = [card.model_dump() for card in output.cards]

        history.append({"role": "assistant", "content": reply})
        save_session_history(session_id, history)

        # 대화 로그 저장
        ChatLog.objects.create(user=user, session_id=session_id, role="user", content=message)
        ChatLog.objects.create(user=user, session_id=session_id, role="assistant", content=reply, cards=cards)

        return Response(
            {
                "reply": reply,
                "cards": cards,
                "session_id": session_id,
                "is_logged_in": request.user.is_authenticated,
                "user": request.user.username if request.user.is_authenticated else None,
            }
        )

    def delete(self, request):
        if request.user.is_authenticated:
            session_id = f"user_{request.user.pk}"
        else:
            if not request.session.session_key:
                return Response({"ok": True})
            session_id = f"anon_{request.session.session_key}"

        clear_session_history(session_id)
        return Response({"ok": True})


class ChatFeedbackView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication, JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = _get_session_id(request)
        user_message = request.data.get("user_message", "").strip()
        assistant_message = request.data.get("assistant_message", "").strip()
        is_positive = request.data.get("is_positive")
        comment = request.data.get("comment", "")

        if not user_message or not assistant_message or is_positive is None:
            return Response(
                {"error": "user_message, assistant_message, is_positive는 필수입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user if request.user.is_authenticated else None
        ChatFeedback.objects.create(
            user=user,
            session_id=session_id,
            user_message=user_message,
            assistant_message=assistant_message,
            is_positive=bool(is_positive),
            comment=comment,
        )
        return Response({"ok": True})
