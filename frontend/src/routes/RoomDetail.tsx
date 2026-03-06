import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  checkBooking,
  getRoom,
  getRoomBookings,
  getRoomReviews,
  createBooking,
  createReview,
  getWishlists,
  createWishlist,
  toggleWishlistRoom,
  deleteRoom,
  getBookings,
} from "../api";
import { getErrorDetail } from "../lib/getErrorDetail";
import type { ICreateBookingVariables, ICreateReviewVariables } from "../api";
import { IReview, IRoomDetail, IWishlist } from "../types";
import useUser from "../lib/useUser";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  Textarea,
  VStack,
  Wrap,
  WrapItem,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import type { Value } from "react-calendar/dist/cjs/shared/types";
import "react-calendar/dist/Calendar.css";
import "../calendar.css";
import {
  FaStar,
  FaPaw,
  FaCheckCircle,
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";

const KIND_LABELS: Record<string, string> = {
  entire_place: "집 전체",
  private_room: "개인실",
  shared_room: "공유 공간",
};

export default function RoomDetail() {
  const { roomPk } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const { isLoading, data, isError } = useQuery<IRoomDetail>({
    queryKey: [`rooms`, roomPk],
    queryFn: getRoom,
  });
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<
    IReview[]
  >({
    queryKey: [`rooms`, roomPk, `reviews`],
    queryFn: getRoomReviews,
  });
  const { data: myBookings } = useQuery<{ kind: string; room?: { pk: number } }[]>({
    queryKey: ["myBookings"],
    queryFn: getBookings,
    enabled: isLoggedIn,
  });
  const hasRoomBooking = myBookings?.some(
    (b) => b.kind === "room" && b.room?.pk === Number(roomPk)
  ) ?? false;
  const [dates, setDates] = useState<Date[]>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.5;
    if (scrollRef.current)
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => {
    isDragging.current = false;
  };
  const onMouseLeave = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const stopDrag = () => {
      isDragging.current = false;
    };
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, []);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = data?.photos ?? [];
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () =>
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextPhoto = () =>
    setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      else if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i !== null && i < photos.length - 1 ? i + 1 : i,
        );
      else if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, photos.length]);

  const { data: checkBookingData, isLoading: isCheckingBooking } = useQuery({
    queryKey: ["check", roomPk, dates],
    queryFn: checkBooking,
    enabled: dates !== undefined,
    gcTime: 0,
  });

  const { data: roomBookings } = useQuery<
    { check_in: string; check_out: string }[]
  >({
    queryKey: ["roomBookings", roomPk],
    queryFn: getRoomBookings,
  });

  const tileDisabled = useMemo(() => {
    return ({ date }: { date: Date }) => {
      if (!roomBookings) return false;
      return roomBookings.some((b) => {
        const checkIn = new Date(b.check_in + "T00:00:00");
        const checkOut = new Date(b.check_out + "T00:00:00");
        return date >= checkIn && date <= checkOut;
      });
    };
  }, [roomBookings]);

  const toast = useToast();
  const queryClient = useQueryClient();

  // 위시리스트
  const { data: wishlists } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isLoggedIn,
  });
  const wishlistedPks = new Set(
    wishlists?.flatMap((w) => w.rooms.map((r) => r.pk)) ?? [],
  );
  const isWishlisted = roomPk ? wishlistedPks.has(Number(roomPk)) : false;
  const wishlistToggle = useMutation({
    mutationFn: async () => {
      const pk = Number(roomPk);
      if (!wishlists || wishlists.length === 0) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistRoom(newWishlist.pk, pk);
      }
      return toggleWishlistRoom(wishlists[0].pk, pk);
    },
    onSuccess: () => {
      toast({
        title: isWishlisted
          ? "위시리스트에서 제거되었습니다."
          : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (error: any) => {
      toast({
        title: "오류가 발생했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const onWishlistClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "로그인이 필요합니다.",
        status: "warning",
        position: "bottom-right",
        duration: 2000,
      });
      return;
    }
    wishlistToggle.mutate();
  };

  // 예약
  const [guests, setGuests] = useState(1);
  const bookingMutation = useMutation({
    mutationFn: (variables: ICreateBookingVariables) =>
      createBooking(roomPk!, variables),
    onSuccess: () => {
      toast({
        title: "예약이 완료되었습니다!",
        status: "success",
        position: "bottom-right",
      });
    },
    onError: (error: any) => {
      toast({
        title: "예약에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const onBooking = useCallback(() => {
    if (!dates || dates.length < 2) return;
    bookingMutation.mutate({
      check_in: dates[0].toLocaleDateString("fr-CA"),
      check_out: dates[1].toLocaleDateString("fr-CA"),
      guests,
    });
  }, [dates, guests, bookingMutation]);

  // 리뷰
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const {
    register: reviewRegister,
    handleSubmit: reviewHandleSubmit,
    reset: reviewReset,
  } = useForm<ICreateReviewVariables>();
  const reviewMutation = useMutation({
    mutationFn: (variables: ICreateReviewVariables) =>
      createReview(roomPk!, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`rooms`, roomPk, `reviews`] });
      toast({
        title: "리뷰가 등록되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      reviewReset();
      onReviewClose();
    },
    onError: (error: any) => {
      toast({
        title: "리뷰 등록에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const onReviewSubmit = (data: ICreateReviewVariables) => {
    reviewMutation.mutate(data);
  };

  // 숙소 삭제
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const deleteRef = useRef<HTMLButtonElement>(null);
  const deleteMutation = useMutation({
    mutationFn: () => deleteRoom(roomPk!),
    onSuccess: () => {
      toast({
        title: "숙소가 삭제되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "삭제에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  if (isError) {
    return (
      <VStack justifyContent={"center"} minH={"50vh"}>
        <Helmet>
          <title>찾을 수 없음 — Airbnb clone</title>
        </Helmet>
        <Heading>숙소를 찾을 수 없습니다.</Heading>
        <Text>삭제되었거나 존재하지 않는 숙소입니다.</Text>
      </VStack>
    );
  }

  return (
    <Box mt={"10"} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{data ? data.name : "로딩 중..."}</title>
      </Helmet>

      {/* 제목 */}
      {isLoading ? (
        <Skeleton height={"36px"} maxW={"60%"} />
      ) : (
        <Flex justify={"space-between"} align={"center"}>
          <Heading fontSize={{ base: "xl", md: "2xl" }}>{data?.name}</Heading>
          <HStack spacing={2}>
            {data?.is_owner && (
              <>
                <Link to={`/rooms/${roomPk}/photos`}>
                  <Button size='sm' variant='outline'>
                    사진 관리
                  </Button>
                </Link>
                <Link to={`/rooms/${roomPk}/edit`}>
                  <Button size='sm' variant='outline'>
                    수정
                  </Button>
                </Link>
                <Button
                  size='sm'
                  colorScheme='red'
                  variant='outline'
                  onClick={onDeleteOpen}
                >
                  삭제
                </Button>
              </>
            )}
            <IconButton
              aria-label='위시리스트'
              variant={"unstyled"}
              icon={
                isWishlisted ? (
                  <FaHeart size={"22px"} color={"rgba(255,56,92,0.85)"} />
                ) : (
                  <FaRegHeart size={"22px"} />
                )
              }
              onClick={onWishlistClick}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            />
          </HStack>
        </Flex>
      )}

      {/* 부제목: 평점 · 리뷰 수 · 위치 */}
      <Box mt={2}>
        {isLoading ? (
          <Skeleton height={"18px"} maxW={"45%"} />
        ) : (
          <Wrap spacing={1} fontSize={"sm"} color={"gray.500"} align={"center"}>
            {typeof data?.rating === "number" && (
              <>
                <WrapItem alignItems={"center"}>
                  <HStack spacing={1}>
                    <FaStar size={12} color='#FF385C' />
                    <Text fontWeight={"semibold"}>
                      {data.rating}
                    </Text>
                  </HStack>
                </WrapItem>
                <WrapItem alignItems={"center"}>
                  <Text>·</Text>
                </WrapItem>
              </>
            )}
            <WrapItem alignItems={"center"}>
              <Text textDecoration={"underline"} cursor={"pointer"}>
                후기 {reviewsData?.length ?? 0}개
              </Text>
            </WrapItem>
            <WrapItem alignItems={"center"}>
              <Text>·</Text>
            </WrapItem>
            <WrapItem alignItems={"center"}>
              <HStack spacing={1}>
                <FaMapMarkerAlt size={11} />
                <Text>
                  {data?.city}, {data?.country}
                </Text>
              </HStack>
            </WrapItem>
          </Wrap>
        )}
      </Box>

      {/* 사진 영역 */}

      {/* 모바일 + 태블릿(~991px): 가로 스크롤 */}
      <Box
        ref={scrollRef}
        display={{ base: "flex", lg: "none" }}
        mt={5}
        gap={2}
        overflowX={"auto"}
        h={{ base: "220px", md: "360px" }}
        cursor={isDragging.current ? "grabbing" : "grab"}
        userSelect={"none"}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        sx={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <Box
              key={i}
              flexShrink={0}
              h={"100%"}
              w={{ base: "280px", md: "480px" }}
              rounded={"xl"}
              overflow={"hidden"}
            >
              <Skeleton h={"100%"} w={"100%"} />
            </Box>
          ))
        ) : data?.photos && data.photos.length > 0 ? (
          data.photos.map((photo, i) => (
            <Box
              key={i}
              flexShrink={0}
              h={"100%"}
              w={{ base: "280px", md: "480px" }}
              rounded={"xl"}
              overflow={"hidden"}
              cursor={"pointer"}
              onClick={() => openLightbox(i)}
            >
              <Image
                objectFit={"cover"}
                w={"100%"}
                h={"100%"}
                src={photo.file}
              />
            </Box>
          ))
        ) : (
          <Box
            flexShrink={0}
            h={"100%"}
            w={"100%"}
            rounded={"xl"}
            bg={"gray.200"} _dark={{ bg: "gray.700" }}
          />
        )}
      </Box>

      {/* 데스크탑(992px+): 5장 그리드 */}
      <Grid
        display={{ base: "none", lg: "grid" }}
        mt={5}
        rounded={"xl"}
        overflow={"hidden"}
        h={"60vh"}
        minH={"400px"}
        gap={2}
        templateRows={"1fr 1fr"}
        templateColumns={"repeat(4, 1fr)"}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <GridItem
            colSpan={index === 0 ? 2 : 1}
            rowSpan={index === 0 ? 2 : 1}
            overflow={"hidden"}
            key={index}
          >
            <Skeleton isLoaded={!isLoading} h={"100%"} w={"100%"}>
              {data?.photos?.[index] ? (
                <Image
                  objectFit={"cover"}
                  w={"100%"}
                  h={"100%"}
                  src={data.photos[index].file}
                  cursor={"pointer"}
                  onClick={() => openLightbox(index)}
                />
              ) : (
                <Box bg={"gray.200"} w={"100%"} h={"100%"} />
              )}
            </Skeleton>
          </GridItem>
        ))}
      </Grid>

      {/* 본문: 모바일 세로 / 데스크탑 2컬럼 */}
      <Grid
        mt={12}
        gap={{ base: 8, lg: 20 }}
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
      >
        {/* 왼쪽 */}
        <Box minW={0}>
          {/* 호스트 정보 */}
          <Flex
            justifyContent={"space-between"}
            alignItems={"flex-start"}
            pb={6}
            gap={4}
          >
            <VStack alignItems={"flex-start"} spacing={2} flex={1} minW={0}>
              {isLoading ? (
                <Skeleton height={"28px"} w={"70%"} />
              ) : (
                <Heading fontSize={{ base: "lg", md: "xl" }}>
                  {data ? (KIND_LABELS[data.kind] ?? data.kind) : ""} · 호스트:{" "}
                  {data?.owner.username}
                </Heading>
              )}
              {isLoading ? (
                <Skeleton height={"18px"} w={"50%"} />
              ) : (
                <Wrap
                  spacing={1}
                  fontSize={"sm"}
                  color={"gray.500"}
                  align={"center"}
                >
                  <WrapItem alignItems={"center"}>
                    <HStack spacing={1}>
                      <FaBed size={13} />
                      <Text>침실 {data?.rooms}개</Text>
                    </HStack>
                  </WrapItem>
                  <WrapItem alignItems={"center"}>
                    <Text>·</Text>
                  </WrapItem>
                  <WrapItem alignItems={"center"}>
                    <HStack spacing={1}>
                      <FaBath size={13} />
                      <Text>욕실 {data?.toilets}개</Text>
                    </HStack>
                  </WrapItem>
                  {data?.pet_friendly && (
                    <>
                      <WrapItem alignItems={"center"}>
                        <Text>·</Text>
                      </WrapItem>
                      <WrapItem alignItems={"center"}>
                        <HStack spacing={1}>
                          <FaPaw size={12} />
                          <Text>반려동물 허용</Text>
                        </HStack>
                      </WrapItem>
                    </>
                  )}
                </Wrap>
              )}
            </VStack>
            <SkeletonCircle size={"14"} isLoaded={!isLoading} flexShrink={0}>
              <Avatar
                name={data?.owner.username}
                size={"lg"}
                src={data?.owner.avatar}
              />
            </SkeletonCircle>
          </Flex>

          <Divider />

          {/* 카테고리 */}
          {(isLoading || data?.category) && (
            <>
              <Box py={5}>
                {isLoading ? (
                  <Skeleton height={"20px"} w={"30%"} />
                ) : (
                  <Wrap spacing={2} align={"center"}>
                    <WrapItem>
                      <Badge
                        colorScheme='red'
                        fontSize={"sm"}
                        px={3}
                        py={1}
                        borderRadius={"full"}
                      >
                        {data?.category?.name}
                      </Badge>
                    </WrapItem>
                    {data?.address && (
                      <WrapItem alignItems={"center"}>
                        <HStack
                          spacing={1}
                          color={"gray.500"}
                          fontSize={"sm"}
                          flexWrap={"wrap"}
                        >
                          <FaMapMarkerAlt size={11} />
                          <Text>{data.address}</Text>
                        </HStack>
                      </WrapItem>
                    )}
                  </Wrap>
                )}
              </Box>
              <Divider />
            </>
          )}

          {/* 설명 */}
          <Box py={6}>
            {isLoading ? (
              <>
                <Skeleton height={"20px"} w={"40%"} mb={3} />
                <SkeletonText mt={2} noOfLines={4} spacing={3} />
              </>
            ) : (
              <>
                <Heading fontSize={"xl"} mb={3}>
                  숙소 소개
                </Heading>
                <Text
                  lineHeight={1.8}
                  whiteSpace={"pre-line"}
                >
                  {data?.description || "소개 내용이 없습니다."}
                </Text>
              </>
            )}
          </Box>

          <Divider />

          {/* 어메니티 */}
          <Box py={6}>
            {isLoading ? (
              <>
                <Skeleton height={"20px"} w={"50%"} mb={4} />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height={"20px"} />
                  ))}
                </SimpleGrid>
              </>
            ) : (
              <>
                <Heading fontSize={"xl"} mb={4}>
                  편의시설
                </Heading>
                {data?.amenities && data.amenities.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {data.amenities.map((amenity) => (
                      <HStack
                        key={amenity.pk}
                        spacing={3}
                        alignItems={"flex-start"}
                      >
                        <Box mt={"2px"} flexShrink={0}>
                          <FaCheckCircle color='#00a699' size={15} />
                        </Box>
                        <VStack alignItems={"flex-start"} spacing={0} minW={0}>
                          <Text fontWeight={"medium"} fontSize={"sm"}>
                            {amenity.name}
                          </Text>
                          {amenity.description && (
                            <Text fontSize={"xs"} color={"gray.400"}>
                              {amenity.description}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text color={"gray.400"} fontSize={"sm"}>
                    등록된 편의시설이 없습니다.
                  </Text>
                )}
              </>
            )}
          </Box>

          <Divider />

          {/* 리뷰 */}
          <Box py={6}>
            {isLoading ? (
              <Skeleton height={"28px"} w={"40%"} mb={6} />
            ) : (
              <HStack spacing={2} mb={6} justifyContent={"space-between"}>
                <HStack spacing={2}>
                  {typeof data?.rating === "number" && (
                    <FaStar color='#FF385C' />
                  )}
                  <Heading fontSize={"xl"}>
                    {typeof data?.rating === "number"
                      ? `${data.rating} · `
                      : ""}
                    후기 {reviewsData?.length ?? 0}개
                  </Heading>
                </HStack>
                {!data?.is_owner && hasRoomBooking && (
                  <Button
                    size={"sm"}
                    colorScheme='red'
                    variant='outline'
                    onClick={onReviewOpen}
                  >
                    리뷰 작성
                  </Button>
                )}
              </HStack>
            )}
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={8}
            >
              {isReviewsLoading
                ? [1, 2, 3, 4].map((i) => (
                    <Box key={i}>
                      <HStack mb={3}>
                        <SkeletonCircle size={"10"} />
                        <VStack alignItems={"flex-start"} spacing={1}>
                          <Skeleton w={"120px"} h={"16px"} />
                          <Skeleton w={"60px"} h={"12px"} />
                        </VStack>
                      </HStack>
                      <SkeletonText noOfLines={3} spacing={2} />
                    </Box>
                  ))
                : reviewsData?.map((review, index) => (
                    <Box key={index}>
                      <HStack spacing={3} mb={3} alignItems={"flex-start"}>
                        <Avatar
                          name={review.user.username}
                          src={review.user.avatar}
                          size={"md"}
                          flexShrink={0}
                        />
                        <VStack alignItems={"flex-start"} spacing={0} minW={0}>
                          <HStack justify="space-between" w="100%">
                            <Heading fontSize={"sm"} noOfLines={1}>
                              {review.user.username}
                            </Heading>
                            <Text fontSize={"xs"} color={"gray.400"}>
                              {new Date(review.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <FaStar size={11} color='#FF385C' />
                            <Text fontSize={"sm"} color={"gray.500"}>
                              {review.rating}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Text fontSize={"sm"} lineHeight={1.7}>
                        {review.payload}
                      </Text>
                    </Box>
                  ))}
            </Grid>
          </Box>
        </Box>

        {/* 오른쪽 - 예약 카드 */}
        <Box>
          <Box
            position={{ base: "static", lg: "sticky" }}
            top={"100px"}
            border={"1px"}
            borderColor={"gray.200"}
            _dark={{ borderColor: "gray.600" }}
            rounded={"2xl"}
            shadow={"xl"}
            p={{ base: 4, md: 6 }}
          >
            {isLoading ? (
              <Skeleton height={"36px"} maxW={"140px"} mb={4} />
            ) : (
              <HStack alignItems={"baseline"} mb={1}>
                <Heading fontSize={"2xl"}>
                  ${data?.price?.toLocaleString()}
                </Heading>
                <Text color={"gray.500"} fontSize={"sm"}>
                  / 박
                </Text>
              </HStack>
            )}
            {isLoading ? (
              <Skeleton height={"16px"} maxW={"120px"} mb={4} />
            ) : (
              <HStack spacing={1} mb={4} fontSize={"sm"} color={"gray.500"}>
                {typeof data?.rating === "number" && (
                  <>
                    <FaStar size={11} color='#FF385C' />
                    <Text fontWeight={"semibold"}>
                      {data.rating}
                    </Text>
                    <Text>·</Text>
                  </>
                )}
                <Text>후기 {reviewsData?.length ?? 0}개</Text>
              </HStack>
            )}
            <Divider mb={4} />
            <HStack fontSize={"sm"} color={"gray.500"} mb={3}>
              <Text>
                체크인{" "}
                <Text as='span' fontWeight={"semibold"}>
                  오후 3:00
                </Text>
              </Text>
              <Text>·</Text>
              <Text>
                체크아웃{" "}
                <Text as='span' fontWeight={"semibold"}>
                  오전 11:00
                </Text>
              </Text>
            </HStack>
            <Box overflowX={"auto"}>
              <Calendar
                onChange={(value: Value) => setDates(value as Date[])}
                prev2Label={null}
                next2Label={null}
                minDetail='month'
                minDate={new Date()}
                maxDate={new Date(Date.now() + 60 * 60 * 24 * 7 * 4 * 6 * 1000)}
                selectRange
                tileDisabled={tileDisabled}
              />
            </Box>
            <FormControl mt={3}>
              <FormLabel fontSize={"sm"}>인원</FormLabel>
              <NumberInput
                min={1}
                max={20}
                value={guests}
                onChange={(_, val) => setGuests(val)}
                size={"sm"}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button
              isDisabled={!checkBookingData?.ok}
              isLoading={
                (isCheckingBooking && dates !== undefined) ||
                bookingMutation.isPending
              }
              mt={4}
              w='100%'
              colorScheme='red'
              size={"lg"}
              rounded={"xl"}
              onClick={onBooking}
            >
              예약하기
            </Button>
            {!isCheckingBooking && !checkBookingData?.ok ? (
              <Text
                color={"red.400"}
                textAlign={"center"}
                mt={3}
                fontSize={"sm"}
              >
                해당 날짜에는 예약할 수 없습니다.
              </Text>
            ) : null}
            <Text
              textAlign={"center"}
              mt={3}
              fontSize={"xs"}
              color={"gray.400"}
            >
              아직 요금이 청구되지 않습니다
            </Text>
          </Box>
        </Box>
      </Grid>

      {/* 리뷰 작성 모달 */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={reviewHandleSubmit(onReviewSubmit)}>
          <ModalHeader>리뷰 작성</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>별점</FormLabel>
                <NumberInput min={1} max={5} defaultValue={5}>
                  <NumberInputField
                    {...reviewRegister("rating", {
                      required: true,
                      valueAsNumber: true,
                      min: 1,
                      max: 5,
                    })}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>리뷰 내용</FormLabel>
                <Textarea
                  {...reviewRegister("payload", { required: true })}
                  placeholder='숙소에 대한 솔직한 후기를 남겨주세요'
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onReviewClose}>
              취소
            </Button>
            <Button
              type='submit'
              colorScheme='red'
              isLoading={reviewMutation.isPending}
            >
              등록
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lightbox */}
      <Modal
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        size={"full"}
        isCentered
      >
        <ModalOverlay bg={"blackAlpha.900"} />
        <ModalContent bg={"transparent"} boxShadow={"none"} m={0}>
          <Flex
            h={"100vh"}
            w={"100vw"}
            alignItems={"center"}
            justifyContent={"center"}
            position={"relative"}
            onClick={closeLightbox}
          >
            {/* 닫기 버튼 */}
            <IconButton
              aria-label={"Close"}
              icon={
                <Text fontSize={"xl"} fontWeight={"bold"} color={"white"}>
                  ✕
                </Text>
              }
              position={"absolute"}
              top={4}
              right={4}
              variant={"ghost"}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              zIndex={10}
            />

            {/* 사진 번호 */}
            <Text
              position={"absolute"}
              top={5}
              left={"50%"}
              transform={"translateX(-50%)"}
              color={"white"}
              fontSize={"sm"}
              fontWeight={"medium"}
              zIndex={10}
            >
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {photos.length}
            </Text>

            {/* 이전 버튼 */}
            <IconButton
              aria-label={"Previous"}
              icon={
                <Text fontSize={"2xl"} color={"white"}>
                  ‹
                </Text>
              }
              position={"absolute"}
              left={{ base: 2, md: 6 }}
              variant={"ghost"}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              isDisabled={lightboxIndex === 0}
              zIndex={10}
              size={"lg"}
            />

            {/* 사진 */}
            {lightboxIndex !== null && photos[lightboxIndex] && (
              <Image
                src={photos[lightboxIndex].file}
                maxH={"90vh"}
                maxW={"90vw"}
                objectFit={"contain"}
                rounded={"md"}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* 다음 버튼 */}
            <IconButton
              aria-label={"Next"}
              icon={
                <Text fontSize={"2xl"} color={"white"}>
                  ›
                </Text>
              }
              position={"absolute"}
              right={{ base: 2, md: 6 }}
              variant={"ghost"}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              isDisabled={lightboxIndex === photos.length - 1}
              zIndex={10}
              size={"lg"}
            />
          </Flex>
        </ModalContent>
      </Modal>

      {/* 숙소 삭제 확인 */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>숙소 삭제</AlertDialogHeader>
            <AlertDialogBody>
              정말로 이 숙소를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteRef} onClick={onDeleteClose}>
                취소
              </Button>
              <Button
                colorScheme='red'
                ml={3}
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
