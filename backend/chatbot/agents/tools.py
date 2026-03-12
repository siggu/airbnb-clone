import hashlib
import os
import requests
from typing import Optional
from agents import function_tool
from agents.run_context import RunContextWrapper
from django.db.models import Avg, Value, Q, Sum
from django.db.models.functions import Coalesce
from django.core.cache import cache

BASE_URL = os.environ.get("CHATBOT_API_BASE_URL", "https://airbnb-clone-production-a5ab.up.railway.app/api/v1")
CACHE_TTL = 45  # seconds
# 로컬 개발환경에서 DB가 비어 있으면 false로 설정해 HTTP 폴백 사용
USE_LOCAL_ORM = os.environ.get("CHATBOT_USE_LOCAL_ORM", "true").lower() == "true"


def _cache_key(*parts: object) -> str:
    """멀티바이트 문자 포함 캐시 키를 안전한 ASCII 해시로 변환"""
    raw = ":".join(str(p) for p in parts)
    return "chatbot:" + hashlib.md5(raw.encode()).hexdigest()


# ── HTTP 헬퍼 ────────────────────────────────────────────────────────

def _get(path: str, params: Optional[dict] = None, token: Optional[str] = None) -> dict:
    headers = {}
    if token:
        headers["Authorization"] = f"Token {token}"
    try:
        response = requests.get(f"{BASE_URL}{path}", params=params, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def _post(path: str, data: dict, token: str) -> dict:
    headers = {"Authorization": f"Token {token}"}
    try:
        response = requests.post(f"{BASE_URL}{path}", json=data, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        return {"error": str(e)}


def _delete(path: str, token: str) -> dict:
    headers = {"Authorization": f"Token {token}"}
    try:
        response = requests.delete(f"{BASE_URL}{path}", headers=headers, timeout=10)
        if response.status_code == 204:
            return {"ok": True}
        return response.json()
    except Exception as e:
        return {"error": str(e)}


# ── HTTP 응답 포맷터 (USE_LOCAL_ORM=false 일 때 사용) ────────────────

def _fmt_room_list_http(data: dict) -> dict:
    results = data.get("results", [])
    if not results:
        return {
            "count": 0,
            "rooms": [],
            "instruction": "검색 결과가 없습니다. 즉시 이 사실을 사용자에게 답변하세요. 다른 조건으로 도구를 다시 호출하지 마세요.",
        }
    return {
        "count": data.get("count", 0),
        "rooms": [
            {
                "pk": r.get("pk"),
                "name": r.get("name"),
                "city": r.get("city"),
                "country": r.get("country"),
                "price": r.get("price"),
                "rating": r.get("rating"),
                "thumbnail_url": r.get("thumbnail_url"),
            }
            for r in results
        ],
    }


def _fmt_room_detail_http(data: dict) -> dict:
    return {
        "pk": data.get("pk") or data.get("id"),
        "name": data.get("name"),
        "city": data.get("city"),
        "country": data.get("country"),
        "address": data.get("address"),
        "price": data.get("price"),
        "rating": data.get("rating"),
        "rooms": data.get("rooms"),
        "bathrooms": data.get("bathrooms"),
        "toilets": data.get("toilets"),
        "pet_friendly": data.get("pet_friendly"),
        "kind": data.get("kind"),
        "description": data.get("description"),
        "owner": data.get("owner", {}).get("username") if data.get("owner") else None,
        "amenities": [a.get("name") for a in data.get("amenities", [])],
        "category": data.get("category", {}).get("name") if data.get("category") else None,
    }


def _fmt_reviews_http(data: dict) -> dict:
    results = data.get("results", [])
    reviews = [
        {
            "user": r.get("user", {}).get("username") if r.get("user") else None,
            "rating": r.get("rating"),
            "payload": r.get("payload"),
            "created_at": r.get("created_at"),
        }
        for r in results
    ]
    if not reviews:
        return {"reviews": [], "instruction": "리뷰가 없습니다. 즉시 이 사실을 답변하세요. 도구를 다시 호출하지 마세요."}
    return {
        "reviews": reviews,
        "instruction": f"DB에 존재하는 리뷰는 총 {len(reviews)}개가 전부입니다. 더 이상 리뷰가 없습니다. 지금 즉시 이 리뷰들로 최종 답변하세요. 이 도구를 절대 다시 호출하지 마세요.",
    }


def _fmt_exp_list_http(data: dict) -> dict:
    results = data.get("results", [])
    if not results:
        return {
            "count": 0,
            "experiences": [],
            "instruction": "검색 결과가 없습니다. 즉시 이 사실을 사용자에게 답변하세요. 다른 조건으로 도구를 다시 호출하지 마세요.",
        }
    return {
        "count": data.get("count", 0),
        "experiences": [
            {
                "pk": e.get("pk"),
                "name": e.get("name"),
                "city": e.get("city"),
                "country": e.get("country"),
                "price": e.get("price"),
                "start": e.get("start"),
                "end": e.get("end"),
                "rating": e.get("rating"),
                "thumbnail_url": e.get("thumbnail_url"),
            }
            for e in results
        ],
    }


def _fmt_exp_detail_http(data: dict) -> dict:
    return {
        "pk": data.get("pk") or data.get("id"),
        "name": data.get("name"),
        "city": data.get("city"),
        "country": data.get("country"),
        "address": data.get("address"),
        "price": data.get("price"),
        "rating": data.get("rating"),
        "start": data.get("start"),
        "end": data.get("end"),
        "description": data.get("description"),
        "max_participants": data.get("max_participants"),
        "host": data.get("host", {}).get("username") if data.get("host") else None,
        "perks": [p.get("name") for p in data.get("perks", [])],
        "category": data.get("category", {}).get("name") if data.get("category") else None,
    }


def _fmt_my_bookings_http(data: dict) -> dict:
    results = data.get("results", [])
    return {
        "count": data.get("count", 0),
        "bookings": [
            {
                "pk": b.get("pk"),
                "kind": b.get("kind"),
                "check_in": b.get("check_in"),
                "check_out": b.get("check_out"),
                "check_in_time": b.get("check_in_time"),
                "check_out_time": b.get("check_out_time"),
                "guests": b.get("guests"),
                "room": b.get("room"),
                "experience": b.get("experience"),
            }
            for b in results
        ],
        "instruction": "조회 완료. 지금 즉시 최종 답변을 생성하세요. 이 도구를 다시 호출하지 마세요.",
    }


def _fmt_wishlists_http(data: list) -> dict:
    return {
        "count": len(data),
        "wishlists": [
            {
                "pk": w.get("pk"),
                "name": w.get("name"),
                "rooms": [
                    {"pk": r.get("pk"), "name": r.get("name"), "city": r.get("city"), "price": r.get("price"), "thumbnail_url": r.get("thumbnail_url")}
                    for r in w.get("rooms", [])
                ],
                "experiences": [
                    {"pk": e.get("pk"), "name": e.get("name"), "city": e.get("city"), "price": e.get("price"), "thumbnail_url": e.get("thumbnail_url")}
                    for e in w.get("experiences", [])
                ],
            }
            for w in data
        ],
    }


# ── ORM 헬퍼 ─────────────────────────────────────────────────────────

def _user_from_token(token: str):
    from rest_framework.authtoken.models import Token as AuthToken
    try:
        return AuthToken.objects.select_related("user").get(key=token).user
    except AuthToken.DoesNotExist:
        return None


def _thumb(obj) -> Optional[str]:
    """prefetch_related("photos") 된 객체에서 첫 번째 사진 URL 반환"""
    photos = list(obj.photos.all())
    if not photos:
        return None
    f = photos[0].file
    return str(f) if f else None


def _room_to_list_dict(r) -> dict:
    return {
        "pk": r.pk,
        "name": r.name,
        "city": r.city,
        "country": r.country,
        "price": r.price,
        "rating": round(float(r.avg_rating), 2) if getattr(r, "avg_rating", None) else None,
        "thumbnail_url": _thumb(r),
    }


def _exp_to_list_dict(e) -> dict:
    return {
        "pk": e.pk,
        "name": e.name,
        "city": e.city,
        "country": e.country,
        "price": e.price,
        "start": str(e.start) if e.start else None,
        "end": str(e.end) if e.end else None,
        "rating": round(float(e.avg_rating), 2) if getattr(e, "avg_rating", None) else None,
        "thumbnail_url": _thumb(e),
    }


# ── Semantic search 헬퍼 ──────────────────────────────────────

def _semantic_search_rooms(base_qs, keyword: str, ordering: str, top_k: int = 20) -> list:
    """임베딩 코사인 유사도 기반 숙소 검색. 키워드 텍스트 검색 결과가 없을 때 폴백으로 사용.
    city/country 필터가 적용된 base_qs에서 찾지 못하면 전체 범위로 재시도합니다."""
    try:
        from rooms.models import Room
        from pgvector.django import CosineDistance
        from chatbot.agents.embeddings import get_embedding

        query_vec = get_embedding(keyword)

        def _run(qs):
            qs = qs.filter(embedding__isnull=False).annotate(
                distance=CosineDistance("embedding", query_vec)
            )
            if ordering == "price_asc":
                qs = qs.order_by("distance", "price")
            elif ordering == "price_desc":
                qs = qs.order_by("distance", "-price")
            elif ordering == "rating":
                qs = qs.order_by("distance", "-avg_rating")
            else:
                qs = qs.order_by("distance")
            return list(qs.filter(distance__lte=0.8)[:top_k])

        results = _run(base_qs)
        if not results:
            # city/country 필터 없이 전체 범위 재시도
            full_qs = Room.objects.prefetch_related("photos").annotate(
                avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
            )
            results = _run(full_qs)
        return results
    except Exception:
        return []


def _semantic_search_experiences(base_qs, keyword: str, ordering: str, top_k: int = 20) -> list:
    """임베딩 코사인 유사도 기반 체험 검색. 키워드 텍스트 검색 결과가 없을 때 폴백으로 사용.
    city/country 필터가 적용된 base_qs에서 찾지 못하면 전체 범위로 재시도합니다."""
    try:
        from experiences.models import Experience
        from pgvector.django import CosineDistance
        from chatbot.agents.embeddings import get_embedding

        query_vec = get_embedding(keyword)

        def _run(qs):
            qs = qs.filter(embedding__isnull=False).annotate(
                distance=CosineDistance("embedding", query_vec)
            )
            if ordering == "price_asc":
                qs = qs.order_by("distance", "price")
            elif ordering == "price_desc":
                qs = qs.order_by("distance", "-price")
            elif ordering == "rating":
                qs = qs.order_by("distance", "-avg_rating")
            else:
                qs = qs.order_by("distance")
            return list(qs.filter(distance__lte=0.8)[:top_k])

        results = _run(base_qs)
        if not results:
            full_qs = Experience.objects.prefetch_related("photos").annotate(
                avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
            )
            results = _run(full_qs)
        return results
    except Exception:
        return []


# ── 검색 / 조회 도구 ───────────────────────────────────────────

@function_tool
def search_rooms(
    keyword: str = "",
    city: str = "",
    country: str = "",
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    kind: str = "",
    pet_friendly: Optional[bool] = None,
    ordering: str = "",
) -> dict:
    """숙소를 검색합니다. 결과를 받으면 즉시 답변하세요.
    - keyword: 이름/도시/국가 통합 검색어
    - city, country: 지역 필터
    - min_price, max_price: 1박 가격 범위 (원)
    - kind: entire_place(집 전체) / private_room(개인실) / shared_room(다인실)
    - pet_friendly: 반려동물 동반 가능 여부
    - ordering: price_asc(저가순) / price_desc(고가순) / rating(평점순)
    """
    if not USE_LOCAL_ORM:
        params: dict = {}
        if keyword:
            params["keyword"] = keyword
        if city:
            params["city"] = city
        if country:
            params["country"] = country
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price
        if kind:
            params["kind"] = kind
        if pet_friendly is not None:
            params["pet_friendly"] = str(pet_friendly).lower()
        if ordering:
            params["ordering"] = ordering
        return _fmt_room_list_http(_get("/rooms/", params))

    cache_key = _cache_key("search_rooms", keyword, city, country, min_price, max_price, kind, pet_friendly, ordering)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from rooms.models import Room
    qs = Room.objects.prefetch_related("photos").annotate(
        avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
    )
    if city:
        qs = qs.filter(city__icontains=city)
    if country:
        qs = qs.filter(country__icontains=country)
    if kind:
        qs = qs.filter(kind=kind)
    if pet_friendly is not None:
        qs = qs.filter(pet_friendly=pet_friendly)
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)

    results = []
    if keyword:
        # 1단계: 키워드 텍스트 검색
        word_q = Q()
        for word in keyword.split():
            word_q |= Q(name__icontains=word) | Q(city__icontains=word) | Q(country__icontains=word)
        keyword_qs = qs.filter(word_q)

        if ordering == "price_asc":
            keyword_qs = keyword_qs.order_by("price")
        elif ordering == "price_desc":
            keyword_qs = keyword_qs.order_by("-price")
        elif ordering == "rating":
            keyword_qs = keyword_qs.order_by("-avg_rating")
        else:
            keyword_qs = keyword_qs.order_by("-created_at")

        results = list(keyword_qs[:20])

        # 2단계: 텍스트 검색 결과 없으면 semantic search 폴백
        if not results:
            results = _semantic_search_rooms(qs, keyword, ordering)
    else:
        if ordering == "price_asc":
            qs = qs.order_by("price")
        elif ordering == "price_desc":
            qs = qs.order_by("-price")
        elif ordering == "rating":
            qs = qs.order_by("-avg_rating")
        else:
            qs = qs.order_by("-created_at")
        results = list(qs[:20])

    if not results:
        result = {
            "count": 0,
            "rooms": [],
            "instruction": "검색 결과가 없습니다. 즉시 이 사실을 사용자에게 답변하세요. 다른 조건으로 도구를 다시 호출하지 마세요.",
        }
    else:
        result = {"count": len(results), "rooms": [_room_to_list_dict(r) for r in results]}

    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def get_room_detail(room_pk: int) -> dict:
    """숙소 상세 정보를 조회합니다.
    편의시설, 평점, 호스트, 반려동물 허용 여부, 방/욕실 수 등을 포함합니다."""
    if not USE_LOCAL_ORM:
        return _fmt_room_detail_http(_get(f"/rooms/{room_pk}"))

    cache_key = _cache_key("room_detail", room_pk)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from rooms.models import Room
    try:
        room = Room.objects.select_related("owner", "category").prefetch_related("amenities").get(pk=room_pk)
    except Room.DoesNotExist:
        return {"error": f"숙소(pk={room_pk})를 찾을 수 없습니다."}

    avg = room.reviews.aggregate(avg=Avg("rating"))["avg"]
    result = {
        "pk": room.pk,
        "name": room.name,
        "city": room.city,
        "country": room.country,
        "address": room.address,
        "price": room.price,
        "rating": round(float(avg), 2) if avg else None,
        "rooms": room.rooms,
        "bathrooms": getattr(room, "bathrooms", None),
        "toilets": room.toilets,
        "pet_friendly": room.pet_friendly,
        "kind": room.kind,
        "description": room.description,
        "owner": room.owner.username if room.owner else None,
        "amenities": [a.name for a in room.amenities.all()],
        "category": room.category.name if room.category else None,
    }
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def get_room_reviews(room_pk: int) -> dict:
    """숙소의 리뷰 목록을 조회합니다. 결과를 받으면 즉시 답변하세요."""
    if not USE_LOCAL_ORM:
        return _fmt_reviews_http(_get(f"/rooms/{room_pk}/reviews"))

    cache_key = _cache_key("room_reviews", room_pk)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from reviews.models import Review
    qs = Review.objects.select_related("user").filter(room_id=room_pk).order_by("-created_at")[:20]
    reviews = [
        {
            "user": r.user.username if r.user else None,
            "rating": r.rating,
            "payload": r.payload,
            "created_at": str(r.created_at.date()) if r.created_at else None,
        }
        for r in qs
    ]
    if not reviews:
        # 빈 결과는 캐시하지 않음 — 리뷰가 나중에 추가될 수 있으므로
        return {"reviews": [], "instruction": "리뷰가 없습니다. 즉시 이 사실을 답변하세요. 도구를 다시 호출하지 마세요."}
    result = {
        "reviews": reviews,
        "instruction": f"DB에 존재하는 리뷰는 총 {len(reviews)}개가 전부입니다. 더 이상 리뷰가 없습니다. 지금 즉시 이 리뷰들로 최종 답변하세요. 이 도구를 절대 다시 호출하지 마세요.",
    }
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def check_room_availability(room_pk: int, check_in: str, check_out: str) -> dict:
    """숙소의 특정 날짜 예약 가능 여부를 확인합니다.
    check_in, check_out은 YYYY-MM-DD 형식입니다.
    반드시 예약 생성 전에 먼저 호출해야 합니다."""
    if not USE_LOCAL_ORM:
        result = _get(f"/rooms/{room_pk}/bookings/check", {"check_in": check_in, "check_out": check_out})
        if "detail" in result or "error" in result:
            return {"error": result.get("detail") or result.get("error"), "instruction": "숙소를 찾을 수 없거나 오류가 발생했습니다. 더 이상 이 도구를 호출하지 마세요. 사용자에게 예약이 불가능하다고 즉시 안내하세요."}
        return result

    from datetime import date
    from bookings.models import Booking
    try:
        ci = date.fromisoformat(check_in)
        co = date.fromisoformat(check_out)
    except ValueError:
        return {"error": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요.", "instruction": "사용자에게 날짜 형식을 다시 알려달라고 요청하세요. 도구를 다시 호출하지 마세요."}

    overlapping = Booking.objects.filter(
        room_id=room_pk,
        check_in__lte=co,
        check_out__gte=ci,
    ).exists()
    if overlapping:
        return {"ok": False, "instruction": "해당 날짜는 이미 예약되어 있습니다. 즉시 사용자에게 알리세요. 도구를 다시 호출하지 마세요."}
    return {"ok": True, "instruction": "예약 가능합니다. 사용자의 동의를 받은 후 create_room_booking을 호출하세요."}


@function_tool
def get_room_booked_dates(room_pk: int) -> dict:
    """숙소의 향후 예약된 날짜 범위 목록을 조회합니다.
    사용자가 '언제 예약 가능한지', '빈 날짜가 언제인지' 물어볼 때 호출합니다.
    결과를 바탕으로 예약되지 않은 날짜를 사용자에게 안내하세요."""
    from datetime import date
    from bookings.models import Booking

    today = date.today()
    bookings = Booking.objects.filter(
        room_id=room_pk,
        check_out__gte=today,
    ).order_by("check_in").values("check_in", "check_out")

    booked = [
        {"check_in": str(b["check_in"]), "check_out": str(b["check_out"])}
        for b in bookings
    ]
    return {
        "today": str(today),
        "booked_ranges": booked,
        "instruction": (
            "위 booked_ranges가 이미 예약된 구간입니다. "
            "오늘 이후 booked_ranges에 포함되지 않는 날짜를 예약 가능한 날짜로 안내하세요. "
            "booked_ranges가 비어 있으면 오늘부터 바로 예약 가능합니다. "
            "날짜를 임의로 추측하거나 만들어내지 마세요."
        ),
    }


@function_tool
def get_experience_booked_dates(experience_pk: int) -> dict:
    """체험의 향후 예약 현황(날짜별 남은 자리)을 조회합니다.
    사용자가 '언제 참가 가능한지', '빈 날짜가 언제인지' 물어볼 때 호출합니다."""
    from datetime import date
    from bookings.models import Booking
    from experiences.models import Experience

    today = date.today()
    try:
        exp = Experience.objects.only("max_participants").get(pk=experience_pk)
    except Experience.DoesNotExist:
        return {"error": f"체험(pk={experience_pk})을 찾을 수 없습니다."}

    bookings = (
        Booking.objects.filter(experience_id=experience_pk, check_in__gte=today)
        .order_by("check_in")
        .values("check_in", "guests")
    )

    from collections import defaultdict
    booked_by_date: dict = defaultdict(int)
    for b in bookings:
        booked_by_date[str(b["check_in"])] += b["guests"]

    schedule = [
        {
            "date": d,
            "booked_guests": cnt,
            "remaining": exp.max_participants - cnt,
        }
        for d, cnt in booked_by_date.items()
        if exp.max_participants - cnt > 0
    ]

    return {
        "today": str(today),
        "max_participants": exp.max_participants,
        "partially_booked_dates": schedule,
        "instruction": (
            "partially_booked_dates에 있는 날짜는 아직 자리가 남아 있는 날짜입니다. "
            "목록에 없는 날짜는 아직 예약이 없어 full 정원으로 참가 가능합니다. "
            "날짜를 임의로 추측하거나 만들어내지 마세요."
        ),
    }


@function_tool
def search_experiences(
    keyword: str = "",
    city: str = "",
    country: str = "",
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    ordering: str = "",
) -> dict:
    """체험/액티비티/투어/클래스/레저 활동을 검색합니다. 결과를 받으면 즉시 답변하세요.
    래프팅, 서핑, 요리, 스노클링, 등산, 사이클링 등 모든 체험 활동에 사용하세요.
    - keyword: 활동명/도시/국가 통합 검색어 (예: "래프팅", "요리 클래스", "서핑")
    - city, country: 지역 필터
    - min_price, max_price: 가격 범위 (원)
    - ordering: price_asc(저가순) / price_desc(고가순) / rating(평점순)
    """
    if not USE_LOCAL_ORM:
        params: dict = {}
        if keyword:
            params["keyword"] = keyword
        if city:
            params["city"] = city
        if country:
            params["country"] = country
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price
        if ordering:
            params["ordering"] = ordering
        return _fmt_exp_list_http(_get("/experiences/", params))

    cache_key = _cache_key("search_experiences", keyword, city, country, min_price, max_price, ordering)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from experiences.models import Experience
    qs = Experience.objects.prefetch_related("photos").annotate(
        avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
    )
    if city:
        qs = qs.filter(city__icontains=city)
    if country:
        qs = qs.filter(country__icontains=country)
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)

    results = []
    if keyword:
        # 1단계: 키워드 텍스트 검색
        word_q = Q()
        for word in keyword.split():
            word_q |= Q(name__icontains=word) | Q(city__icontains=word) | Q(country__icontains=word)
        keyword_qs = qs.filter(word_q)

        if ordering == "price_asc":
            keyword_qs = keyword_qs.order_by("price")
        elif ordering == "price_desc":
            keyword_qs = keyword_qs.order_by("-price")
        elif ordering == "rating":
            keyword_qs = keyword_qs.order_by("-avg_rating")
        else:
            keyword_qs = keyword_qs.order_by("-created_at")

        results = list(keyword_qs[:20])

        # 2단계: 텍스트 검색 결과 없으면 semantic search 폴백
        if not results:
            results = _semantic_search_experiences(qs, keyword, ordering)
    else:
        if ordering == "price_asc":
            qs = qs.order_by("price")
        elif ordering == "price_desc":
            qs = qs.order_by("-price")
        elif ordering == "rating":
            qs = qs.order_by("-avg_rating")
        else:
            qs = qs.order_by("-created_at")
        results = list(qs[:20])

    if not results:
        result = {
            "count": 0,
            "experiences": [],
            "instruction": "검색 결과가 없습니다. 즉시 이 사실을 사용자에게 답변하세요. 다른 조건으로 도구를 다시 호출하지 마세요.",
        }
    else:
        result = {"count": len(results), "experiences": [_exp_to_list_dict(e) for e in results]}

    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def get_experience_detail(experience_pk: int) -> dict:
    """체험 상세 정보를 조회합니다.
    perks(혜택), 평점, 호스트, 최대 인원, 시작/종료 시간 등을 포함합니다."""
    if not USE_LOCAL_ORM:
        return _fmt_exp_detail_http(_get(f"/experiences/{experience_pk}"))

    cache_key = _cache_key("exp_detail", experience_pk)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from experiences.models import Experience
    try:
        exp = Experience.objects.select_related("host", "category").prefetch_related("perks").get(pk=experience_pk)
    except Experience.DoesNotExist:
        return {"error": f"체험(pk={experience_pk})을 찾을 수 없습니다."}

    avg = exp.reviews.aggregate(avg=Avg("rating"))["avg"]
    result = {
        "pk": exp.pk,
        "name": exp.name,
        "city": exp.city,
        "country": exp.country,
        "address": exp.address,
        "price": exp.price,
        "rating": round(float(avg), 2) if avg else None,
        "start": str(exp.start) if exp.start else None,
        "end": str(exp.end) if exp.end else None,
        "description": exp.description,
        "max_participants": exp.max_participants,
        "host": exp.host.username if exp.host else None,
        "perks": [p.name for p in exp.perks.all()],
        "category": exp.category.name if exp.category else None,
    }
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def get_experience_reviews(experience_pk: int) -> dict:
    """체험의 리뷰 목록을 조회합니다. 결과를 받으면 즉시 답변하세요."""
    if not USE_LOCAL_ORM:
        return _fmt_reviews_http(_get(f"/experiences/{experience_pk}/reviews"))

    cache_key = _cache_key("exp_reviews", experience_pk)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from reviews.models import Review
    qs = Review.objects.select_related("user").filter(experience_id=experience_pk).order_by("-created_at")[:20]
    reviews = [
        {
            "user": r.user.username if r.user else None,
            "rating": r.rating,
            "payload": r.payload,
            "created_at": str(r.created_at.date()) if r.created_at else None,
        }
        for r in qs
    ]
    if not reviews:
        # 빈 결과는 캐시하지 않음 — 리뷰가 나중에 추가될 수 있으므로
        return {"reviews": [], "instruction": "리뷰가 없습니다. 즉시 이 사실을 답변하세요. 도구를 다시 호출하지 마세요."}
    result = {
        "reviews": reviews,
        "instruction": f"DB에 존재하는 리뷰는 총 {len(reviews)}개가 전부입니다. 더 이상 리뷰가 없습니다. 지금 즉시 이 리뷰들로 최종 답변하세요. 이 도구를 절대 다시 호출하지 마세요.",
    }
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def check_experience_availability(experience_pk: int, check_in: str) -> dict:
    """체험의 특정 날짜 예약 가능 여부와 남은 인원을 확인합니다.
    check_in은 YYYY-MM-DD 형식입니다.
    반드시 예약 생성 전에 먼저 호출해야 합니다."""
    if not USE_LOCAL_ORM:
        result = _get(f"/experiences/{experience_pk}/bookings/check", {"check_in": check_in})
        if "detail" in result or "error" in result:
            return {"error": result.get("detail") or result.get("error"), "instruction": "체험을 찾을 수 없거나 오류가 발생했습니다. 더 이상 이 도구를 호출하지 마세요. 사용자에게 예약이 불가능하다고 즉시 안내하세요."}
        return result

    from datetime import date
    from bookings.models import Booking
    from experiences.models import Experience
    try:
        ci = date.fromisoformat(check_in)
    except ValueError:
        return {"error": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요."}

    try:
        exp = Experience.objects.only("max_participants").get(pk=experience_pk)
    except Experience.DoesNotExist:
        return {"error": f"체험(pk={experience_pk})을 찾을 수 없습니다."}

    booked = Booking.objects.filter(
        experience_id=experience_pk,
        check_in=ci,
    ).aggregate(total=Sum("guests"))["total"] or 0

    remaining = exp.max_participants - booked
    return {
        "ok": remaining > 0,
        "max_participants": exp.max_participants,
        "booked_guests": booked,
        "remaining": remaining,
    }


# ── 유저 프로필 조회 도구 ──────────────────────────────────────

@function_tool
def get_user_rooms(username: str) -> dict:
    """특정 유저가 등록한 숙소 목록을 조회합니다. 결과를 받으면 즉시 답변하세요."""
    if not USE_LOCAL_ORM:
        return _fmt_room_list_http(_get(f"/users/@{username}/rooms"))

    cache_key = _cache_key("user_rooms", username)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from rooms.models import Room
    qs = Room.objects.filter(owner__username=username).prefetch_related("photos").annotate(
        avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
    ).order_by("-created_at")[:20]
    results = list(qs)
    if not results:
        result = {"count": 0, "rooms": [], "message": "해당 유저가 등록한 숙소가 없습니다."}
    else:
        result = {"count": len(results), "rooms": [_room_to_list_dict(r) for r in results]}
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def get_user_reviews(username: str) -> dict:
    """특정 유저가 작성한 리뷰 목록을 조회합니다. 결과를 받으면 즉시 답변하세요."""
    if not USE_LOCAL_ORM:
        return _fmt_reviews_http(_get(f"/users/@{username}/reviews"))

    cache_key = _cache_key("user_reviews", username)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from reviews.models import Review
    qs = Review.objects.select_related("user").filter(user__username=username).order_by("-created_at")[:20]
    reviews = [
        {
            "user": r.user.username if r.user else None,
            "rating": r.rating,
            "payload": r.payload,
            "created_at": str(r.created_at.date()) if r.created_at else None,
        }
        for r in qs
    ]
    if not reviews:
        result = {"reviews": [], "instruction": "해당 유저가 작성한 리뷰가 없습니다. 즉시 이 사실을 답변하세요. 도구를 다시 호출하지 마세요."}
    else:
        result = {
            "reviews": reviews,
            "instruction": f"DB에 존재하는 리뷰는 총 {len(reviews)}개가 전부입니다. 더 이상 리뷰가 없습니다. 지금 즉시 이 리뷰들로 최종 답변하세요. 이 도구를 절대 다시 호출하지 마세요.",
        }
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def get_user_experiences(username: str) -> dict:
    """특정 유저가 등록한 체험 목록을 조회합니다. 결과를 받으면 즉시 답변하세요."""
    if not USE_LOCAL_ORM:
        return _fmt_exp_list_http(_get(f"/users/@{username}/experiences"))

    cache_key = _cache_key("user_experiences", username)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    from experiences.models import Experience
    qs = Experience.objects.filter(host__username=username).prefetch_related("photos").annotate(
        avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
    ).order_by("-created_at")[:20]
    results = list(qs)
    if not results:
        result = {"count": 0, "experiences": [], "message": "해당 유저가 등록한 체험이 없습니다."}
    else:
        result = {"count": len(results), "experiences": [_exp_to_list_dict(e) for e in results]}
    cache.set(cache_key, result, CACHE_TTL)
    return result


@function_tool
def check_room_booking_mine(ctx: RunContextWrapper, room_pk: int) -> dict:
    """내가 특정 숙소를 예약한 이력이 있는지 확인합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}

    if not USE_LOCAL_ORM:
        return _get(f"/rooms/{room_pk}/bookings/check-mine", token=token)

    user = _user_from_token(token)
    if not user:
        return {"error": "유효하지 않은 인증 토큰입니다."}
    from bookings.models import Booking
    has_booking = Booking.objects.filter(user=user, room_id=room_pk).exists()
    return {"has_booking": has_booking}


@function_tool
def check_experience_booking_mine(ctx: RunContextWrapper, experience_pk: int) -> dict:
    """내가 특정 체험을 예약한 이력이 있는지 확인합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}

    if not USE_LOCAL_ORM:
        return _get(f"/experiences/{experience_pk}/bookings/check-mine", token=token)

    user = _user_from_token(token)
    if not user:
        return {"error": "유효하지 않은 인증 토큰입니다."}
    from bookings.models import Booking
    has_booking = Booking.objects.filter(user=user, experience_id=experience_pk).exists()
    return {"has_booking": has_booking}


@function_tool
def get_my_bookings(ctx: RunContextWrapper) -> dict:
    """내 예약 목록을 조회합니다. 로그인이 필요합니다. 결과를 받으면 즉시 답변하세요."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}

    if not USE_LOCAL_ORM:
        return _fmt_my_bookings_http(_get("/bookings/", token=token))

    user = _user_from_token(token)
    if not user:
        return {"error": "유효하지 않은 인증 토큰입니다."}
    from bookings.models import Booking
    qs = Booking.objects.filter(user=user).select_related("room", "experience").order_by("-check_in")[:20]
    bookings = [
        {
            "pk": b.pk,
            "kind": b.kind,
            "check_in": str(b.check_in) if b.check_in else None,
            "check_out": str(b.check_out) if b.check_out else None,
            "check_in_time": str(b.check_in_time) if b.check_in_time else None,
            "check_out_time": str(b.check_out_time) if b.check_out_time else None,
            "guests": b.guests,
            "room": {"pk": b.room.pk, "name": b.room.name} if b.room else None,
            "experience": {"pk": b.experience.pk, "name": b.experience.name} if b.experience else None,
        }
        for b in qs
    ]
    return {
        "count": len(bookings),
        "bookings": bookings,
        "instruction": "조회 완료. 지금 즉시 최종 답변을 생성하세요. 이 도구를 다시 호출하지 마세요.",
    }


@function_tool
def get_my_wishlists(ctx: RunContextWrapper) -> dict:
    """내 위시리스트 목록과 담긴 숙소/체험을 조회합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}

    if not USE_LOCAL_ORM:
        data = _get("/wishlists/", token=token)
        if isinstance(data, list):
            return _fmt_wishlists_http(data)
        return data

    user = _user_from_token(token)
    if not user:
        return {"error": "유효하지 않은 인증 토큰입니다."}
    from wishlists.models import Wishlist
    qs = Wishlist.objects.filter(user=user).prefetch_related(
        "rooms__photos",
        "experiences__photos",
    )
    wishlists = []
    for w in qs:
        wishlists.append({
            "pk": w.pk,
            "name": w.name,
            "rooms": [
                {
                    "pk": r.pk,
                    "name": r.name,
                    "city": r.city,
                    "price": r.price,
                    "thumbnail_url": _thumb(r),
                }
                for r in w.rooms.all()
            ],
            "experiences": [
                {
                    "pk": e.pk,
                    "name": e.name,
                    "city": e.city,
                    "price": e.price,
                    "thumbnail_url": _thumb(e),
                }
                for e in w.experiences.all()
            ],
        })
    return {"count": len(wishlists), "wishlists": wishlists}


# ── 액션 도구 (로그인 필요, HTTP 호출) ─────────────────────────

@function_tool
def create_room_booking(
    ctx: RunContextWrapper,
    room_pk: int,
    check_in: str,
    check_out: str,
    guests: int,
) -> dict:
    """숙소를 예약합니다. 로그인이 필요합니다.
    반드시 check_room_availability로 가능 여부 확인 후 호출하세요.
    check_in, check_out은 YYYY-MM-DD 형식입니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    return _post(
        f"/rooms/{room_pk}/bookings",
        {"check_in": check_in, "check_out": check_out, "guests": guests},
        token,
    )


@function_tool
def create_experience_booking(
    ctx: RunContextWrapper,
    experience_pk: int,
    check_in: str,
    guests: int,
    check_in_time: str = "",
    check_out_time: str = "",
) -> dict:
    """체험을 예약합니다. 로그인이 필요합니다.
    반드시 check_experience_availability로 가능 여부 확인 후 호출하세요.
    check_in은 YYYY-MM-DD, check_in_time/check_out_time은 HH:MM:SS 형식입니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    data: dict = {"check_in": check_in, "guests": guests}
    if check_in_time:
        data["check_in_time"] = check_in_time
    if check_out_time:
        data["check_out_time"] = check_out_time
    return _post(f"/experiences/{experience_pk}/bookings", data, token)


@function_tool
def cancel_booking(ctx: RunContextWrapper, booking_pk: int) -> dict:
    """예약을 취소합니다. 로그인이 필요합니다.
    이미 시작된 예약은 취소할 수 없습니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    return _delete(f"/bookings/{booking_pk}/", token)


@function_tool
def toggle_wishlist_room(ctx: RunContextWrapper, wishlist_pk: int, room_pk: int) -> dict:
    """위시리스트에 숙소를 추가하거나 제거합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    return _post(f"/wishlists/{wishlist_pk}/rooms/{room_pk}", {}, token)


tools = [
    search_rooms,
    get_room_detail,
    get_room_reviews,
    check_room_availability,
    get_room_booked_dates,
    search_experiences,
    get_experience_detail,
    get_experience_reviews,
    check_experience_availability,
    get_experience_booked_dates,
    create_room_booking,
    create_experience_booking,
    get_my_bookings,
    cancel_booking,
    toggle_wishlist_room,
    get_my_wishlists,
    get_user_rooms,
    get_user_reviews,
    get_user_experiences,
    check_room_booking_mine,
    check_experience_booking_mine,
]
