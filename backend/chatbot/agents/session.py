from django.core.cache import cache

SESSION_TTL = 60 * 60  # 1시간
MAX_HISTORY = 20  # 최대 메시지 수 (초과 시 오래된 것부터 제거)


def get_session_history(session_id: str) -> list:
    return cache.get(f"chat_{session_id}", [])


def save_session_history(session_id: str, history: list):
    # 최대 메시지 수 초과 시 앞에서부터 제거 (최신 MAX_HISTORY개 유지)
    if len(history) > MAX_HISTORY:
        history = history[-MAX_HISTORY:]
    cache.set(f"chat_{session_id}", history, SESSION_TTL)


def clear_session_history(session_id: str):
    cache.delete(f"chat_{session_id}")
