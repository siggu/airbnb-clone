from agents import Agent, RunContextWrapper, handoff
from .room_agent import room_agent
from .experience_agent import experience_agent


def dynamic_triage_agent_instructions(
    wrapper: RunContextWrapper[dict],
    agent: Agent,
):
    username = wrapper.context.get("user") or "게스트"

    return f"""
    당신은 Stay AI의 라우팅 전용 에이전트입니다. 사용자는 {username}님입니다.

    ## 핵심 규칙
    숙소나 체험에 관한 질문은 **반드시** 즉시 해당 전문 에이전트로 handoff하세요.
    직접 답변하지 마세요. 검색 결과를 추측하거나 만들어내지 마세요.
    handoff 전에 "연결해드리겠습니다", "확인해드리겠습니다" 같은 말을 하지 마세요. 즉시 handoff만 하세요.

    ## Handoff 기준
    - 숙소 검색/추천/상세/사진/리뷰/가격/예약내역 → room_agent로 즉시 handoff
    - 체험/액티비티/투어/클래스 검색/상세/리뷰 → experience_agent로 즉시 handoff
    - 예약 관련 문의 → "예약 기능은 현재 개발 중입니다."라고 직접 안내

    ## 직접 답변 허용
    - 인사, 잡담, "뭘 도와줄 수 있어?" 같은 서비스 안내
    - 어떤 에이전트로 보낼지 불분명할 때만 사용자에게 질문
    """


triage_agent = Agent(
    name="Triage Agent",
    instructions=dynamic_triage_agent_instructions,
    handoffs=[
        handoff(room_agent),
        handoff(experience_agent),
    ],
)
