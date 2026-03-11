import requests
from typing import Optional
from agents import function_tool
from agents.run_context import RunContextWrapper

BASE_URL = "https://airbnb-clone-production-a5ab.up.railway.app/api/v1"


# ── HTTP 헬퍼 ──────────────────────────────────────────────────

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


# ── 응답 가공: 챗봇에 필요한 필드만 추출 ───────────────────────

def _format_room_list(data: dict) -> dict:
    """숙소 목록 응답에서 챗봇에 필요한 필드만 추출"""
    results = data.get("results", [])
    if not results:
        return {"count": 0, "rooms": [], "message": "검색 조건에 맞는 숙소가 없습니다."}
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


def _format_room_detail(data: dict) -> dict:
    """숙소 상세 응답에서 챗봇에 필요한 필드만 추출"""
    return {
        "pk": data.get("pk"),
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


def _format_experience_list(data: dict) -> dict:
    """체험 목록 응답에서 챗봇에 필요한 필드만 추출"""
    results = data.get("results", [])
    if not results:
        return {"count": 0, "experiences": [], "message": "검색 조건에 맞는 체험이 없습니다."}
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


def _format_experience_detail(data: dict) -> dict:
    """체험 상세 응답에서 챗봇에 필요한 필드만 추출"""
    return {
        "pk": data.get("pk"),
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


def _format_reviews(data: dict) -> dict:
    """리뷰 목록 응답에서 챗봇에 필요한 필드만 추출"""
    results = data.get("results", [])
    return {
        "count": data.get("count", 0),
        "reviews": [
            {
                "user": r.get("user", {}).get("username") if r.get("user") else None,
                "rating": r.get("rating"),
                "payload": r.get("payload"),
                "created_at": r.get("created_at"),
            }
            for r in results
        ],
    }


def _format_my_wishlists(data: list) -> dict:
    """위시리스트 응답에서 챗봇에 필요한 필드만 추출"""
    return {
        "count": len(data),
        "wishlists": [
            {
                "pk": w.get("pk"),
                "name": w.get("name"),
                "rooms": [
                    {"pk": r.get("pk"), "name": r.get("name"), "city": r.get("city"), "price": r.get("price"), "rating": r.get("rating")}
                    for r in w.get("rooms", [])
                ],
                "experiences": [
                    {"pk": e.get("pk"), "name": e.get("name"), "city": e.get("city"), "price": e.get("price")}
                    for e in w.get("experiences", [])
                ],
            }
            for w in data
        ],
    }


def _format_my_bookings(data: dict) -> dict:
    """내 예약 목록 응답에서 챗봇에 필요한 필드만 추출"""
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
    }


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
    page: int = 1,
) -> dict:
    """숙소를 검색합니다.
    - keyword: 이름/도시/국가 통합 검색어
    - city, country: 지역 필터
    - min_price, max_price: 1박 가격 범위 (원)
    - kind: entire_place(집 전체) / private_room(개인실) / shared_room(다인실)
    - pet_friendly: 반려동물 동반 가능 여부
    - ordering: price_asc(저가순) / price_desc(고가순) / rating(평점순)
    - page: 페이지 번호 (기본 1, 페이지당 20개)
    """
    params: dict = {"page": page}
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
    return _format_room_list(_get("/rooms/", params))


@function_tool
def get_room_detail(room_pk: int) -> dict:
    """숙소 상세 정보를 조회합니다.
    편의시설, 평점, 호스트, 반려동물 허용 여부, 방/욕실 수 등을 포함합니다."""
    return _format_room_detail(_get(f"/rooms/{room_pk}"))


@function_tool
def get_room_reviews(room_pk: int, page: int = 1) -> dict:
    """숙소의 리뷰 목록을 조회합니다. (페이지당 5개)"""
    return _format_reviews(_get(f"/rooms/{room_pk}/reviews", {"page": page}))


@function_tool
def check_room_availability(room_pk: int, check_in: str, check_out: str) -> dict:
    """숙소의 특정 날짜 예약 가능 여부를 확인합니다.
    check_in, check_out은 YYYY-MM-DD 형식입니다.
    반드시 예약 생성 전에 먼저 호출해야 합니다."""
    return _get(f"/rooms/{room_pk}/bookings/check", {"check_in": check_in, "check_out": check_out})


@function_tool
def search_experiences(
    keyword: str = "",
    city: str = "",
    country: str = "",
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    ordering: str = "",
    page: int = 1,
) -> dict:
    """체험/액티비티/투어/클래스/레저 활동을 검색합니다.
    래프팅, 서핑, 요리, 스노클링, 등산, 사이클링 등 모든 체험 활동에 사용하세요.
    - keyword: 활동명/도시/국가 통합 검색어 (예: "래프팅", "요리 클래스", "서핑")
    - city, country: 지역 필터
    - min_price, max_price: 가격 범위 (원)
    - ordering: price_asc(저가순) / price_desc(고가순) / rating(평점순)
    - page: 페이지 번호 (기본 1, 페이지당 20개)
    """
    params: dict = {"page": page}
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
    return _format_experience_list(_get("/experiences/", params))


@function_tool
def get_experience_detail(experience_pk: int) -> dict:
    """체험 상세 정보를 조회합니다.
    perks(혜택), 평점, 호스트, 최대 인원, 시작/종료 시간 등을 포함합니다."""
    return _format_experience_detail(_get(f"/experiences/{experience_pk}"))


@function_tool
def get_experience_reviews(experience_pk: int, page: int = 1) -> dict:
    """체험의 리뷰 목록을 조회합니다. (페이지당 5개)"""
    return _format_reviews(_get(f"/experiences/{experience_pk}/reviews", {"page": page}))


@function_tool
def check_experience_availability(experience_pk: int, check_in: str) -> dict:
    """체험의 특정 날짜 예약 가능 여부와 남은 인원을 확인합니다.
    check_in은 YYYY-MM-DD 형식입니다.
    반드시 예약 생성 전에 먼저 호출해야 합니다."""
    return _get(f"/experiences/{experience_pk}/bookings/check", {"check_in": check_in})


# ── 유저 프로필 조회 도구 ──────────────────────────────────────

@function_tool
def get_user_rooms(username: str, page: int = 1) -> dict:
    """특정 유저가 등록한 숙소 목록을 조회합니다."""
    return _format_room_list(_get(f"/users/@{username}/rooms", {"page": page}))


@function_tool
def get_user_reviews(username: str, page: int = 1) -> dict:
    """특정 유저가 작성한 리뷰 목록을 조회합니다."""
    return _format_reviews(_get(f"/users/@{username}/reviews", {"page": page}))


@function_tool
def get_user_experiences(username: str, page: int = 1) -> dict:
    """특정 유저가 등록한 체험 목록을 조회합니다."""
    return _format_experience_list(_get(f"/users/@{username}/experiences", {"page": page}))


@function_tool
def check_room_booking_mine(ctx: RunContextWrapper, room_pk: int) -> dict:
    """내가 특정 숙소를 예약한 이력이 있는지 확인합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    return _get(f"/rooms/{room_pk}/bookings/check-mine", token=token)


@function_tool
def check_experience_booking_mine(ctx: RunContextWrapper, experience_pk: int) -> dict:
    """내가 특정 체험을 예약한 이력이 있는지 확인합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    return _get(f"/experiences/{experience_pk}/bookings/check-mine", token=token)


# ── 액션 도구 (로그인 필요) ────────────────────────────────────

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
def get_my_bookings(ctx: RunContextWrapper, page: int = 1) -> dict:
    """내 예약 목록을 조회합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    return _format_my_bookings(_get("/bookings/", {"page": page}, token))


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


@function_tool
def get_my_wishlists(ctx: RunContextWrapper) -> dict:
    """내 위시리스트 목록과 담긴 숙소/체험을 조회합니다. 로그인이 필요합니다."""
    token = ctx.context.get("token")
    if not token:
        return {"error": "로그인이 필요합니다."}
    data = _get("/wishlists/", token=token)
    if isinstance(data, list):
        return _format_my_wishlists(data)
    return data


tools = [
    search_rooms,
    get_room_detail,
    get_room_reviews,
    check_room_availability,
    search_experiences,
    get_experience_detail,
    get_experience_reviews,
    check_experience_availability,
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
