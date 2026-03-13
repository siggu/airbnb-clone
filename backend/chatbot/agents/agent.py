from typing import Optional
from pydantic import BaseModel
from agents import Agent, ModelSettings
from .tools import tools
from .prompts import SYSTEM_PROMPT


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


chat_agent = Agent(
    name="Stay AI Assistant",
    instructions=SYSTEM_PROMPT,
    tools=list(tools),
    model="gpt-4o-mini",
    model_settings=ModelSettings(tool_choice="auto", parallel_tool_calls=True),
)
