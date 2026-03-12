import {
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  Link,
  Spinner,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  IoChatbubbleEllipsesOutline,
  IoClose,
  IoRefreshOutline,
  IoSend,
  IoThumbsDownOutline,
  IoThumbsUpOutline,
} from "react-icons/io5";
import axios from "axios";

const API = process.env.REACT_APP_CHAT_API_URL || "http://127.0.0.1:8000/api/v1/";

interface Card {
  pk: number;
  name: string;
  type: "room" | "experience";
  city: string;
  country: string;
  price: number;
  rating: number | null;
  thumbnail_url: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: Card[];
}

function CardItem({ card }: { card: Card }) {
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const frontendUrl = `http://127.0.0.1:3000/${card.type === "room" ? "rooms" : "experiences"}/${card.pk}`;
  return (
    <Link href={frontendUrl} isExternal _hover={{ textDecoration: "none" }}>
      <HStack
        bg={cardBg}
        borderRadius="lg"
        overflow="hidden"
        spacing={3}
        p={2}
        w="full"
        _hover={{ opacity: 0.85 }}
        transition="opacity 0.15s"
      >
        {card.thumbnail_url ? (
          <Image
            src={card.thumbnail_url}
            alt={card.name}
            boxSize="56px"
            borderRadius="md"
            objectFit="cover"
            flexShrink={0}
          />
        ) : (
          <Box boxSize="56px" bg="gray.200" borderRadius="md" flexShrink={0} />
        )}
        <Box flex={1} minW={0}>
          <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>
            {card.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {card.city}
          </Text>
          <Text fontSize="xs" color="blue.400" fontWeight="medium">
            ₩{card.price.toLocaleString()}
          </Text>
          {card.rating != null && (
            <Text fontSize="xs" color="gray.500">
              ⭐ {card.rating}
            </Text>
          )}
        </Box>
      </HStack>
    </Link>
  );
}

function AssistantMessage({
  msg,
  onFeedback,
}: {
  msg: Message & { userContent?: string };
  onFeedback: (isPositive: boolean, userMsg: string, assistantMsg: string) => void;
}) {
  const [voted, setVoted] = useState<boolean | null>(null);

  const handleVote = (isPositive: boolean) => {
    if (voted !== null) return;
    setVoted(isPositive);
    onFeedback(isPositive, msg.userContent || "", msg.content);
  };

  return (
    <Flex direction="column" align="flex-start" w="full">
      <Box
        bg={useColorModeValue("gray.100", "gray.600")}
        borderRadius="xl"
        borderBottomLeftRadius="sm"
        px={3}
        py={2}
        maxW="85%"
      >
        <Text fontSize="sm" whiteSpace="pre-wrap">
          {msg.content}
        </Text>
      </Box>
      {msg.cards && msg.cards.length > 0 && (
        <VStack mt={2} spacing={1} w="85%" align="stretch">
          {msg.cards.map((card) => (
            <CardItem key={`${card.type}-${card.pk}`} card={card} />
          ))}
        </VStack>
      )}
      {msg.content && (
        <HStack mt={1} spacing={1}>
          <Tooltip label="도움이 됐어요" fontSize="xs">
            <IconButton
              aria-label="좋아요"
              icon={<IoThumbsUpOutline />}
              size="xs"
              variant="ghost"
              color={voted === true ? "green.400" : "gray.400"}
              onClick={() => handleVote(true)}
              isDisabled={voted !== null}
            />
          </Tooltip>
          <Tooltip label="아쉬워요" fontSize="xs">
            <IconButton
              aria-label="싫어요"
              icon={<IoThumbsDownOutline />}
              size="xs"
              variant="ghost"
              color={voted === false ? "blue.400" : "gray.400"}
              onClick={() => handleVote(false)}
              isDisabled={voted !== null}
            />
          </Tooltip>
        </HStack>
      )}
    </Flex>
  );
}

const MIN_W = 280, MAX_W = 800, MIN_H = 360, MAX_H = 900;

const TOOL_LABELS: Record<string, string> = {
  search_rooms: "숙소 검색 중...",
  search_experiences: "체험 검색 중...",
  get_room_detail: "숙소 상세 조회 중...",
  get_experience_detail: "체험 상세 조회 중...",
  get_room_reviews: "리뷰 조회 중...",
  get_experience_reviews: "체험 리뷰 조회 중...",
  check_room_availability: "예약 가능 여부 확인 중...",
  check_experience_availability: "체험 예약 가능 여부 확인 중...",
  create_room_booking: "예약 처리 중...",
  create_experience_booking: "체험 예약 처리 중...",
  get_my_bookings: "예약 목록 조회 중...",
  cancel_booking: "예약 취소 처리 중...",
  toggle_wishlist_room: "위시리스트 처리 중...",
  get_my_wishlists: "위시리스트 조회 중...",
  get_user_rooms: "호스트 숙소 조회 중...",
  get_user_reviews: "유저 리뷰 조회 중...",
  get_user_experiences: "호스트 체험 조회 중...",
  check_room_booking_mine: "예약 이력 확인 중...",
  check_experience_booking_mine: "체험 예약 이력 확인 중...",
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<(Message & { userContent?: string })[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("답변 생성 중...");
  const [size, setSize] = useState({ w: 360, h: 520 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dw = dragRef.current.startX - ev.clientX;
      const dh = dragRef.current.startY - ev.clientY;
      setSize({
        w: Math.min(MAX_W, Math.max(MIN_W, dragRef.current.startW + dw)),
        h: Math.min(MAX_H, Math.max(MIN_H, dragRef.current.startH + dh)),
      });
    };
    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.400", "blue.500");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", cards: [], userContent: text },
    ]);
    setInput("");
    setIsLoading(true);
    setStatusText("답변 생성 중...");
    scrollToBottom();

    try {
      const response = await fetch(`${API}chat/stream/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `서버 오류 ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6));

          if (payload.type === "text") {
            setMessages((prev) => {
              const msgs = [...prev];
              const last = msgs[msgs.length - 1];
              msgs[msgs.length - 1] = { ...last, content: last.content + payload.data };
              return msgs;
            });
            scrollToBottom();
          } else if (payload.type === "tool_start") {
            setStatusText(TOOL_LABELS[payload.data] ?? `${payload.data} 중...`);
          } else if (payload.type === "tool_end") {
            setStatusText("답변 생성 중...");
          } else if (payload.type === "done") {
            const { reply, cards } = payload.data;
            setMessages((prev) => {
              const msgs = [...prev];
              msgs[msgs.length - 1] = { role: "assistant", content: reply, cards: cards || [], userContent: text };
              return msgs;
            });
            scrollToBottom();
          } else if (payload.type === "error") {
            setMessages((prev) => {
              const msgs = [...prev];
              msgs[msgs.length - 1] = { role: "assistant", content: `⚠️ ${payload.data}` };
              return msgs;
            });
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          msgs[msgs.length - 1] = { role: "assistant", content: `⚠️ ${err.message || "오류가 발생했습니다."}` };
        } else {
          msgs.push({ role: "assistant", content: `⚠️ ${err.message || "오류가 발생했습니다."}` });
        }
        return msgs;
      });
    } finally {
      setIsLoading(false);
      setStatusText("답변 생성 중...");
      setTimeout(() => inputRef.current?.focus(), 0);
      scrollToBottom();
    }
  };

  const resetSession = async () => {
    try {
      await axios.delete(`${API}chat/`, { withCredentials: true });
    } catch {}
    setMessages([]);
  };

  const sendFeedback = async (
    isPositive: boolean,
    userMessage: string,
    assistantMessage: string
  ) => {
    try {
      await axios.post(
        `${API}chat/feedback/`,
        { user_message: userMessage, assistant_message: assistantMessage, is_positive: isPositive },
        { withCredentials: true }
      );
    } catch {}
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      {!isOpen && (
        <IconButton
          aria-label="챗봇 열기"
          icon={<IoChatbubbleEllipsesOutline size={24} />}
          position="fixed"
          bottom={6}
          right={6}
          zIndex={1000}
          borderRadius="full"
          bg="blue.400"
          color="white"
          boxSize="56px"
          fontSize="xl"
          boxShadow="lg"
          _hover={{ bg: "blue.500", transform: "scale(1.05)" }}
          transition="all 0.2s"
          onClick={() => setIsOpen(true)}
        />
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <Box
          position="fixed"
          bottom={6}
          right={6}
          zIndex={1000}
          w={`${size.w}px`}
          h={`${size.h}px`}
          bg={bg}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* 리사이즈 핸들 (좌상단 모서리) */}
          <Box
            position="absolute"
            top={0}
            left={0}
            w="18px"
            h="18px"
            cursor="nw-resize"
            zIndex={10}
            onMouseDown={onResizeMouseDown}
            borderTopLeftRadius="2xl"
            _after={{
              content: '""',
              position: "absolute",
              top: "4px",
              left: "4px",
              width: "8px",
              height: "8px",
              borderTop: "2px solid",
              borderLeft: "2px solid",
              borderColor: "whiteAlpha.600",
              borderRadius: "1px",
            }}
          />
          {/* 헤더 */}
          <Flex
            bg={headerBg}
            color="white"
            px={4}
            py={3}
            align="center"
            justify="space-between"
            flexShrink={0}
          >
            <HStack spacing={2}>
              <IoChatbubbleEllipsesOutline size={18} />
              <Text fontWeight="semibold" fontSize="sm">
                Stay AI 어시스턴트
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Tooltip label="대화 초기화" fontSize="xs">
                <IconButton
                  aria-label="초기화"
                  icon={<IoRefreshOutline />}
                  size="xs"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300" }}
                  onClick={resetSession}
                />
              </Tooltip>
              <IconButton
                aria-label="닫기"
                icon={<IoClose />}
                size="xs"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                onClick={() => setIsOpen(false)}
              />
            </HStack>
          </Flex>

          {/* 메시지 목록 */}
          <VStack
            flex={1}
            overflowY="auto"
            spacing={3}
            px={3}
            py={3}
            align="stretch"
            css={{ "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: "#CBD5E0", borderRadius: "4px" } }}
          >
            {messages.length === 0 && (
              <Box textAlign="center" mt={8}>
                <Text fontSize="sm" color="gray.400">
                  안녕하세요! 숙소, 체험, 예약 등
                </Text>
                <Text fontSize="sm" color="gray.400">
                  무엇이든 물어보세요 😊
                </Text>
              </Box>
            )}
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <Flex key={i} justify="flex-end">
                  <Box
                    bg="blue.400"
                    color="white"
                    borderRadius="xl"
                    borderBottomRightRadius="sm"
                    px={3}
                    py={2}
                    maxW="85%"
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {msg.content}
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <AssistantMessage key={i} msg={msg} onFeedback={sendFeedback} />
              )
            )}
            {isLoading && (
              <Flex align="center" gap={2}>
                <Spinner size="xs" color="blue.400" />
                <Text fontSize="xs" color="gray.400">
                  {statusText}
                </Text>
              </Flex>
            )}
            <div ref={bottomRef} />
          </VStack>

          {/* 입력창 */}
          <HStack
            px={3}
            py={3}
            borderTop="1px solid"
            borderColor={borderColor}
            flexShrink={0}
            spacing={2}
          >
            <Input
              ref={inputRef}
              placeholder="메시지를 입력하세요..."
              size="sm"
              borderRadius="full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              isDisabled={isLoading}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #FC8181" }}
            />
            <IconButton
              aria-label="전송"
              icon={<IoSend />}
              size="sm"
              borderRadius="full"
              bg="blue.400"
              color="white"
              _hover={{ bg: "blue.500" }}
              onClick={sendMessage}
              isLoading={isLoading}
              isDisabled={!input.trim()}
            />
          </HStack>
        </Box>
      )}
    </>
  );
}