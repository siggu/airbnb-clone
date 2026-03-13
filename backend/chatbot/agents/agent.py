from typing import Optional
from pydantic import BaseModel


class CardItem(BaseModel):
    type: str  # "room" | "experience"
    pk: int
    name: str
    city: str
    country: str
    price: int
    rating: Optional[float] = None
    thumbnail_url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    cards: list[CardItem] = []
