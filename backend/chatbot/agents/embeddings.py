"""
임베딩 생성 유틸리티.
text-embedding-3-small (1536차원) 을 사용합니다.
"""

import os
from openai import OpenAI

_client: OpenAI | None = None

EMBED_MODEL = "text-embedding-3-small"


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client


def get_embedding(text: str) -> list[float]:
    """텍스트의 임베딩 벡터를 반환합니다."""
    text = text.replace("\n", " ").strip()
    response = _get_client().embeddings.create(input=[text], model=EMBED_MODEL)
    return response.data[0].embedding


def build_room_text(room) -> str:
    """Room 모델 → 임베딩용 텍스트"""
    parts = [
        room.name,
        room.country,
        room.city,
        room.description or "",
        room.address or "",
        room.kind or "",
        "반려동물 가능" if room.pet_friendly else "반려동물 불가",
    ]
    amenities = list(room.amenities.values_list("name", flat=True))
    if amenities:
        parts.append("편의시설: " + ", ".join(amenities))
    return " | ".join(p for p in parts if p)


def build_experience_text(exp) -> str:
    """Experience 모델 → 임베딩용 텍스트"""
    parts = [
        exp.name,
        exp.country,
        exp.city,
        exp.description or "",
        exp.address or "",
    ]
    perks = list(exp.perks.values_list("name", flat=True))
    if perks:
        parts.append("포함: " + ", ".join(perks))
    return " | ".join(p for p in parts if p)
