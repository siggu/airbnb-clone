import asyncio
import json as _json
import queue
import re
import threading
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from config.authentication import CsrfExemptSessionAuthentication, JWTAuthentication
from asgiref.sync import sync_to_async
from django.core.cache import cache
from agents import Runner, RunHooks, RunConfig
from .agents.triage_agent import triage_agent
from .agents.agent import ChatResponse
from .agents.session import (
    get_session_history,
    save_session_history,
    clear_session_history,
)
from .models import ChatLog, ChatFeedback, BlockedKeyword, FAQ

# 세션별 현재 실행 중인 도구 이름 추적
_active_tools: dict[str, str] = {}


def _get_session_id(request):
    if request.user.is_authenticated:
        return f"user_{request.user.pk}"
    if not request.session.session_key:
        request.session.create()
    return f"anon_{request.session.session_key}"


def _check_blocked(message: str) -> str | None:
    """금지어가 포함되어 있으면 금지어를 반환, 없으면 None"""
    keywords = cache.get("chatbot:blocked_keywords")
    if keywords is None:
        keywords = list(
            BlockedKeyword.objects.filter(is_active=True).values_list(
                "keyword", flat=True
            )
        )
        cache.set("chatbot:blocked_keywords", keywords, 300)
    for kw in keywords:
        if kw.lower() in message.lower():
            return kw
    return None


def _get_model_name() -> str:
    """Return the active ChatbotConfig model name, defaulting to gpt-5-mini."""
    import logging
    _logger = logging.getLogger(__name__)
    cached = cache.get("chatbot:model_name")
    if cached is not None:
        _logger.warning(f"[MODEL] using cached model: {cached}")
        return cached
    from .models import ChatbotConfig

    config = ChatbotConfig.objects.filter(is_active=True).first()
    name = config.model_name if config else "gpt-5-mini"
    _logger.warning(f"[MODEL] resolved model: {name} (config={'found' if config else 'not found, using default'})")
    cache.set("chatbot:model_name", name, 60)
    return name


def _get_faq_context() -> str:
    """Return active FAQ entries as system prompt context."""
    cached = cache.get("chatbot:faq_context")
    if cached is not None:
        return cached
    faqs = FAQ.objects.filter(is_active=True)
    if not faqs.exists():
        return ""
    faq_lines = [""]
    for faq in faqs:
        faq_lines.append(f"Q: {faq.question}")
        faq_lines.append(f"A: {faq.answer}")
    result = chr(10).join(faq_lines)
    cache.set("chatbot:faq_context", result, 300)
    return result


class ChatView(APIView):
    authentication_classes = [
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
        JWTAuthentication,
    ]
    permission_classes = [AllowAny]

    def _get_token(self, user) -> str:
        token, _ = Token.objects.get_or_create(user=user)
        return token.key

    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response(
                {"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

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
            "token": self._get_token(request.user)
            if request.user.is_authenticated
            else None,
            "user": request.user.username if request.user.is_authenticated else None,
            "is_logged_in": request.user.is_authenticated,
        }

        history = get_session_history(session_id)
        history.append({"role": "user", "content": message})

        # FAQ 컨텍스트를 히스토리 앞에 system 메시지로 주입
        faq_context = _get_faq_context()
        input_with_faq: list = list(history)
        if faq_context:
            input_with_faq = [
                {"role": "system", "content": faq_context}
            ] + input_with_faq

        import logging

        logger = logging.getLogger(__name__)
        logger.warning(
            f"[CHAT] session={session_id} user={agent_context.get('user')} message={message!r}"
        )
        logger.warning(f"[CHAT] history_length={len(history)}")

        class DebugHooks(RunHooks):
            async def on_tool_start(self, context, agent, tool):
                _active_tools[session_id] = tool.name
                logger.warning(
                    f"[HOOK] tool_start agent={agent.name} tool={tool.name} input={str(getattr(tool, '_last_input', '?'))[:200]}"
                )

            async def on_tool_end(self, context, agent, tool, result):
                _active_tools.pop(session_id, None)
                logger.warning(
                    f"[HOOK] tool_end tool={tool.name} result={str(result)[:200]}"
                )

            async def on_handoff(self, context, from_agent, to_agent):
                logger.warning(f"[HOOK] handoff {from_agent.name} -> {to_agent.name}")

            async def on_agent_start(self, context, agent):
                logger.warning(f"[HOOK] agent_start name={agent.name}")

            async def on_agent_end(self, context, agent, output):
                _active_tools.pop(session_id, None)
                logger.warning(
                    f"[HOOK] agent_end name={agent.name} output={str(output)[:200]}"
                )

        try:
            result = asyncio.run(
                Runner.run(
                    triage_agent,
                    input=input_with_faq,
                    context=agent_context,
                    max_turns=10,
                    hooks=DebugHooks(),
                    run_config=RunConfig(model=_get_model_name()),
                )
            )
            raw_output = result.final_output
            logger.warning(
                f"[CHAT] final_output type={type(raw_output).__name__} value={str(raw_output)[:300]}"
            )

            # 각 turn 상세 로그
            for i, item in enumerate(result.new_items):
                name = type(item).__name__
                if name == "ToolCallItem":
                    logger.warning(f"[TURN {i}] ToolCall: {str(item)[:300]}")
                elif name == "ToolCallOutputItem":
                    logger.warning(f"[TURN {i}] ToolOutput: {str(item)[:300]}")
                elif name == "HandoffCallItem":
                    logger.warning(f"[TURN {i}] Handoff: {str(item)[:300]}")
                elif name == "HandoffOutputItem":
                    logger.warning(f"[TURN {i}] HandoffOutput: {str(item)[:300]}")
                elif name == "MessageOutputItem":
                    logger.warning(f"[TURN {i}] Message: {str(item)[:300]}")
                else:
                    logger.warning(f"[TURN {i}] {name}: {str(item)[:200]}")

            # 출력이 str(JSON)인 경우와 ChatResponse인 경우 모두 처리
            if isinstance(raw_output, str):
                import json as _json
                from .agents.agent import ChatResponse

                try:
                    parsed = _json.loads(raw_output)
                    output = ChatResponse(
                        reply=parsed.get("reply", raw_output),
                        cards=parsed.get("cards", []),
                    )
                except Exception:
                    output = ChatResponse(reply=raw_output, cards=[])
            else:
                output = raw_output
        except Exception as e:
            logger.error(f"[CHAT ERROR] {type(e).__name__}: {e}", exc_info=True)
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        reply = re.sub(r"!\[.*?\]\(.*?\)", "", output.reply).strip()
        cards = [card.model_dump() for card in output.cards]

        # (pk=숫자) 패턴 제거 — AI가 tool 결과에서 pk를 직접 참조하므로 히스토리에 불필요
        reply_display = re.sub(r"\s*\(pk=\d+\)", "", reply).strip()

        history.append({"role": "assistant", "content": reply_display})
        save_session_history(session_id, history)

        # 대화 로그 저장
        ChatLog.objects.create(
            user=user, session_id=session_id, role="user", content=message
        )
        ChatLog.objects.create(
            user=user,
            session_id=session_id,
            role="assistant",
            content=reply_display,
            cards=cards,
        )

        return Response(
            {
                "reply": reply_display,
                "cards": cards,
                "session_id": session_id,
                "is_logged_in": request.user.is_authenticated,
                "user": request.user.username
                if request.user.is_authenticated
                else None,
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


class ChatStreamView(APIView):
    authentication_classes = [
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
        JWTAuthentication,
    ]
    permission_classes = [AllowAny]

    def _get_token(self, user) -> str:
        token, _ = Token.objects.get_or_create(user=user)
        return token.key

    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response(
                {"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        blocked = _check_blocked(message)
        if blocked:
            return Response(
                {"error": f"해당 메시지는 전송할 수 없습니다. (금지어: {blocked})"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_id = _get_session_id(request)
        user = request.user if request.user.is_authenticated else None
        agent_context = {
            "token": self._get_token(request.user)
            if request.user.is_authenticated
            else None,
            "user": request.user.username if request.user.is_authenticated else None,
            "is_logged_in": request.user.is_authenticated,
        }

        history = get_session_history(session_id)
        history.append({"role": "user", "content": message})
        faq_context = _get_faq_context()
        input_with_faq = list(history)
        if faq_context:
            input_with_faq = [
                {"role": "system", "content": faq_context}
            ] + input_with_faq

        import logging

        logger = logging.getLogger(__name__)
        logger.warning(
            f"[CHAT] session={session_id} user={agent_context.get('user')} message={message!r}"
        )
        logger.warning(f"[CHAT] history_length={len(history)}")
        for i, h in enumerate(history):
            logger.warning(
                f"[HISTORY {i}] role={h['role']} content={str(h['content'])[:200]}"
            )

        model_name = _get_model_name()
        q: queue.Queue = queue.Queue()

        def _extract_cards(tool_name: str, result) -> list:
            """tool 결과에서 card 목록을 추출합니다."""
            if not isinstance(result, dict):
                return []
            cards = []
            if tool_name in ("search_rooms", "get_room_detail", "get_user_rooms"):
                items = result.get("rooms") or ([result] if result.get("pk") else [])
                for r in items:
                    if r.get("pk"):
                        cards.append(
                            {
                                "type": "room",
                                "pk": r["pk"],
                                "name": r.get("name", ""),
                                "city": r.get("city", ""),
                                "country": r.get("country", ""),
                                "price": r.get("price", 0),
                                "rating": r.get("rating"),
                                "thumbnail_url": r.get("thumbnail_url"),
                            }
                        )
            elif tool_name in (
                "search_experiences",
                "get_experience_detail",
                "get_user_experiences",
            ):
                items = result.get("experiences") or (
                    [result] if result.get("pk") else []
                )
                for e in items:
                    if e.get("pk"):
                        cards.append(
                            {
                                "type": "experience",
                                "pk": e["pk"],
                                "name": e.get("name", ""),
                                "city": e.get("city", ""),
                                "country": e.get("country", ""),
                                "price": e.get("price", 0),
                                "rating": e.get("rating"),
                                "thumbnail_url": e.get("thumbnail_url"),
                            }
                        )
            return cards

        async def run_agent():
            collected_cards: list = []

            class StreamHooks(RunHooks):
                async def on_tool_start(self, context, agent, tool):
                    _active_tools[session_id] = tool.name
                    q.put(("tool_start", tool.name))
                    logger.warning(
                        f"[HOOK] tool_start agent={agent.name} tool={tool.name}"
                    )

                async def on_tool_end(self, context, agent, tool, result):
                    _active_tools.pop(session_id, None)
                    q.put(("tool_end", None))
                    logger.warning(
                        f"[HOOK] tool_end tool={tool.name} result={str(result)[:200]}"
                    )
                    new_cards = _extract_cards(tool.name, result)
                    if new_cards:
                        collected_cards.extend(new_cards)

                async def on_handoff(self, context, from_agent, to_agent):
                    logger.warning(
                        f"[HOOK] handoff {from_agent.name} -> {to_agent.name}"
                    )
                    q.put(("handoff", to_agent.name))

                async def on_agent_start(self, context, agent):
                    logger.warning(f"[HOOK] agent_start name={agent.name}")

                async def on_agent_end(self, context, agent, output):
                    _active_tools.pop(session_id, None)
                    logger.warning(
                        f"[HOOK] agent_end name={agent.name} output={str(output)[:200]}"
                    )

            try:
                result = Runner.run_streamed(
                    triage_agent,
                    input=input_with_faq,
                    context=agent_context,
                    max_turns=10,
                    hooks=StreamHooks(),
                    run_config=RunConfig(model=model_name),
                )
                async for event in result.stream_events():
                    if event.type == "raw_response_event":
                        data = event.data
                        if getattr(data, "type", None) == "response.output_text.delta":
                            delta = getattr(data, "delta", "")
                            if delta:
                                q.put(("text", delta))
                        elif (
                            getattr(data, "type", None)
                            == "response.function_call_arguments_done"
                        ):
                            logger.warning(
                                f"[TOOL_CALL] name={getattr(data, 'name', '?')} args={getattr(data, 'arguments', '?')}"
                            )

                raw_output = result.final_output
                if isinstance(raw_output, ChatResponse):
                    reply = raw_output.reply
                    cards_raw = collected_cards or [
                        c.model_dump() for c in raw_output.cards
                    ]
                else:
                    reply = str(raw_output) if raw_output else ""
                    cards_raw = collected_cards

                reply = re.sub(r"!\[.*?\]\(.*?\)", "", reply).strip()

                # (pk=숫자) 패턴 제거
                reply_display = re.sub(r"\s*\(pk=\d+\)", "", reply).strip()

                history.append({"role": "assistant", "content": reply_display})
                await sync_to_async(save_session_history)(session_id, history)

                await sync_to_async(ChatLog.objects.create)(
                    user=user, session_id=session_id, role="user", content=message
                )
                await sync_to_async(ChatLog.objects.create)(
                    user=user,
                    session_id=session_id,
                    role="assistant",
                    content=reply_display,
                    cards=cards_raw,
                )

                q.put(("done", {"reply": reply_display, "cards": cards_raw}))
            except Exception as e:
                import logging

                logging.getLogger(__name__).error(
                    f"[STREAM ERROR] {type(e).__name__}: {e}", exc_info=True
                )
                q.put(("error", str(e)))
            finally:
                _active_tools.pop(session_id, None)
                q.put(None)

        def run_in_thread():
            asyncio.run(run_agent())

        threading.Thread(target=run_in_thread, daemon=True).start()

        def generate():
            while True:
                item = q.get()
                if item is None:
                    break
                event_type, data = item
                yield f"data: {_json.dumps({'type': event_type, 'data': data})}\n\n"

        resp = StreamingHttpResponse(generate(), content_type="text/event-stream")
        resp["Cache-Control"] = "no-cache"
        resp["X-Accel-Buffering"] = "no"
        return resp


class ChatStatusView(APIView):
    authentication_classes = [
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
        JWTAuthentication,
    ]
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = _get_session_id(request)
        tool = _active_tools.get(session_id, "")
        return Response({"tool": tool})


class ChatFeedbackView(APIView):
    authentication_classes = [
        CsrfExemptSessionAuthentication,
        TokenAuthentication,
        JWTAuthentication,
    ]
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
