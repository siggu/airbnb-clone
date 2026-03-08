import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExperience,
  getWishlists,
  createWishlist,
  toggleWishlistExperience,
  deleteExperience,
  createExperienceBooking,
  getExperienceBookings,
  getExperienceReviews,
  createExperienceReview,
  updateReview,
  deleteReview,
  checkMyExperienceBooking,
} from "../api";
import type { ICreateExperienceBookingVariables, ICreateReviewVariables, IPaginatedResponse } from "../api";
import { IExperienceDetail, IReview, IWishlist } from "../types";
import Pagination from "../components/Pagination";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import {
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaHeart,
  FaRegHeart,
  FaCamera,
  FaStar,
} from "react-icons/fa";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import useUser from "../lib/useUser";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { getErrorDetail } from "../lib/getErrorDetail";
import { useForm } from "react-hook-form";

export default function ExperienceDetail() {
  const { experiencePk } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useUser();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isLoading, data, isError } = useQuery<IExperienceDetail>({
    queryKey: ["experiences", experiencePk],
    queryFn: getExperience,
  });

  const { data: wishlists } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isLoggedIn,
  });

  const wishlistedPks = new Set(
    wishlists?.flatMap((w) => (w.experiences ?? []).map((e) => e.pk)) ?? [],
  );
  const isWishlisted = experiencePk
    ? wishlistedPks.has(Number(experiencePk))
    : false;

  const wishlistToggle = useMutation({
    mutationFn: async () => {
      const pk = Number(experiencePk);
      if (!wishlists || wishlists.length === 0) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistExperience(newWishlist.pk, pk);
      }
      return toggleWishlistExperience(wishlists[0].pk, pk);
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

  const deleteMutation = useMutation({
    mutationFn: () => deleteExperience(experiencePk!),
    onSuccess: () => {
      toast({
        title: "체험이 삭제되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      navigate("/experiences");
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

  const bookingMutation = useMutation({
    mutationFn: (variables: ICreateExperienceBookingVariables) =>
      createExperienceBooking(experiencePk!, variables),
    onSuccess: () => {
      toast({
        title: "예약이 완료되었습니다!",
        status: "success",
        position: "bottom-right",
      });
      navigate(`/users/${user?.username}?tab=bookings`);
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

  const { data: experienceBookings } = useQuery<
    { check_in: string; check_out: string; guests: number }[]
  >({
    queryKey: ["experienceBookings", experiencePk],
    queryFn: getExperienceBookings,
  });

  const [reviewPage, setReviewPage] = useState(1);
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<IPaginatedResponse<IReview>>({
    queryKey: ["experiences", experiencePk, "reviews", reviewPage],
    queryFn: getExperienceReviews,
  });

  const { data: myBookingCheck } = useQuery<{ has_booking: boolean }>({
    queryKey: ["experienceBookingCheckMine", experiencePk],
    queryFn: checkMyExperienceBooking,
    enabled: isLoggedIn,
  });
  const hasExperienceBooking = myBookingCheck?.has_booking ?? false;

  const {
    register: reviewRegister,
    handleSubmit: reviewHandleSubmit,
    reset: reviewReset,
  } = useForm<ICreateReviewVariables>();

  const reviewMutation = useMutation({
    mutationFn: (variables: ICreateReviewVariables) =>
      createExperienceReview(experiencePk!, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences", experiencePk, "reviews"] });
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

  const {
    isOpen: isEditReviewOpen,
    onOpen: onEditReviewOpen,
    onClose: onEditReviewClose,
  } = useDisclosure();
  const {
    register: editReviewRegister,
    handleSubmit: editReviewHandleSubmit,
    reset: editReviewReset,
  } = useForm<ICreateReviewVariables>();
  const [editingReview, setEditingReview] = useState<IReview | null>(null);
  const editReviewMutation = useMutation({
    mutationFn: (variables: ICreateReviewVariables) =>
      updateReview(editingReview!.pk, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences", experiencePk, "reviews"] });
      toast({
        title: "리뷰가 수정되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      onEditReviewClose();
      setEditingReview(null);
    },
    onError: (error: any) => {
      toast({
        title: "리뷰 수정에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const {
    isOpen: isDeleteReviewOpen,
    onOpen: onDeleteReviewOpen,
    onClose: onDeleteReviewClose,
  } = useDisclosure();
  const deleteReviewRef = useRef<HTMLButtonElement>(null);
  const [deletingReviewPk, setDeletingReviewPk] = useState<number | null>(null);
  const deleteReviewMutation = useMutation({
    mutationFn: (pk: number) => deleteReview(pk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences", experiencePk, "reviews"] });
      toast({
        title: "리뷰가 삭제되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      onDeleteReviewClose();
      setDeletingReviewPk(null);
    },
    onError: (error: any) => {
      toast({
        title: "리뷰 삭제에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const reviews = reviewsData?.results ?? [];

  // 날짜별 예약 인원 합산
  const bookedGuestsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of experienceBookings ?? []) {
      map[b.check_in] = (map[b.check_in] ?? 0) + b.guests;
    }
    return map;
  }, [experienceBookings]);

  const maxParticipants = data?.max_participants ?? 2;

  // 앞으로 30일간 날짜 슬롯 생성
  const availableSlots = useMemo(() => {
    const slots: {
      dateStr: string;
      label: string;
      dayLabel: string;
      booked: boolean;
      remaining: number;
    }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const DAY_NAMES = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toLocaleDateString("fr-CA");
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const dayName = DAY_NAMES[d.getDay()];
      const isToday = i === 1;
      const booked = bookedGuestsByDate[dateStr] ?? 0;
      const remaining = maxParticipants - booked;
      slots.push({
        dateStr,
        label: `${month}월 ${day}일(${dayName.slice(0, 1)}요일)`,
        dayLabel: isToday ? "내일" : "",
        booked: remaining <= 0,
        remaining,
      });
    }
    return slots;
  }, [bookedGuestsByDate, maxParticipants]);

  const onBooking = useCallback(() => {
    if (!selectedDate) return;
    bookingMutation.mutate({
      check_in: selectedDate,
      check_in_time: data?.start || undefined,
      check_out_time: data?.end || undefined,
      guests,
    });
  }, [selectedDate, guests, data, bookingMutation]);

  const photos = (data?.photos ?? []).filter((p) => p.status === "approved" && p.file);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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

  if (isError) {
    return (
      <VStack justifyContent='center' minH='50vh'>
        <Heading>체험을 찾을 수 없습니다.</Heading>
        <Text>삭제되었거나 존재하지 않는 체험입니다.</Text>
      </VStack>
    );
  }

  return (
    <Box mt={10} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{data ? data.name : "로딩 중..."}</title>
      </Helmet>

      {/* 제목 */}
      {isLoading ? (
        <Skeleton height='36px' maxW='60%' />
      ) : (
        <Flex justify='space-between' align='center'>
          <Heading fontSize={{ base: "xl", md: "2xl" }}>{data?.name}</Heading>
          <HStack spacing={2}>
            {data?.is_owner && (
              <>
                <Link to={`/experiences/${experiencePk}/photos`}>
                  <IconButton
                    aria-label='사진 업로드'
                    variant={"unstyled"}
                    icon={<FaCamera size={"20px"} />}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  />
                </Link>
                <Link to={`/experiences/${experiencePk}/edit`}>
                  <Button size='sm' variant='outline'>
                    수정
                  </Button>
                </Link>
                <Button
                  size='sm'
                  colorScheme='blue'
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
                  <FaHeart size={"22px"} color={"rgba(66,153,225,0.85)"} />
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

      {/* 위치 및 시간 */}
      <Box mt={2}>
        {isLoading ? (
          <Skeleton height='18px' maxW='45%' />
        ) : (
          <Wrap spacing={3} fontSize='sm' color='gray.500' align='center'>
            <WrapItem alignItems='center'>
              <HStack spacing={1}>
                <FaMapMarkerAlt size={12} />
                <Text>
                  {data?.city}, {data?.country}
                </Text>
              </HStack>
            </WrapItem>
            <WrapItem alignItems='center'>
              <Text>·</Text>
            </WrapItem>
            <WrapItem alignItems='center'>
              <HStack spacing={1}>
                <FaClock size={12} />
                <Text>
                  {data?.start} ~ {data?.end}
                </Text>
              </HStack>
            </WrapItem>
            <WrapItem alignItems='center'>
              <Text>·</Text>
            </WrapItem>
            <WrapItem alignItems='center'>
              <Text fontWeight='bold'>
                ₩{data?.price.toLocaleString()} / 1인
              </Text>
            </WrapItem>
          </Wrap>
        )}
      </Box>

      {/* 사진 갤러리 */}
      {(isLoading || photos.length > 0) && (
        <Box mt={5}>
          {isLoading ? (
            <Grid templateColumns='repeat(3, 1fr)' gap={2} h='240px'>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} h='100%' rounded='xl' />
              ))}
            </Grid>
          ) : (
            <Box
              display='flex'
              gap={2}
              overflowX='auto'
              h={{ base: "200px", md: "300px" }}
              sx={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {photos.map((photo, i) => (
                <Box
                  key={i}
                  flexShrink={0}
                  h='100%'
                  w={{ base: "260px", md: "400px" }}
                  rounded='xl'
                  overflow='hidden'
                  cursor='pointer'
                  onClick={() => openLightbox(i)}
                >
                  <Image
                    objectFit='cover'
                    w='100%'
                    h='100%'
                    src={photo.file!}
                    alt={photo.description}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Divider my={6} />

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={10}>
        <GridItem>
          {/* 호스트 */}
          <HStack mb={6} spacing={4}>
            {isLoading ? (
              <>
                <Skeleton w='50px' h='50px' rounded='full' />
                <SkeletonText noOfLines={2} w='200px' />
              </>
            ) : (
              <>
                <Link to={`/users/${data?.host.username}`}>
                  <Avatar
                    name={data?.host.name}
                    src={data?.host.avatar}
                    size='md'
                    cursor='pointer'
                  />
                </Link>
                <Box>
                  <Box display='flex'>
                    <Link to={`/users/${data?.host.username}`}>
                      <Text fontWeight='bold' _hover={{ textDecoration: "underline" }}>
                        {data?.host.name} 
                      </Text>
                    </Link>
                    <Text>님이 진행하는 체험</Text>
                  </Box>
                  <Text fontSize='sm' color='gray.400'>
                    {data?.host.bio || data?.host.name} · ID {data?.host.public_id?.slice(0, 8)}
                  </Text>
                </Box>
              </>
            )}
          </HStack>

          <Divider mb={6} />

          {/* 설명 */}
          <Box mb={6}>
            <Heading size='md' mb={3}>
              체험 소개
            </Heading>
            {isLoading ? (
              <SkeletonText noOfLines={4} />
            ) : (
              <Text lineHeight={1.8}>{data?.description}</Text>
            )}
          </Box>

          {/* 주소 */}
          {data?.address && (
            <>
              <Divider mb={6} />
              <Box mb={6}>
                <Heading size='md' mb={3}>
                  위치
                </Heading>
                <HStack spacing={2} color='gray.500'>
                  <FaMapMarkerAlt />
                  <Text>{data.address}</Text>
                </HStack>
              </Box>
            </>
          )}

          {/* 포함 사항 */}
          {(isLoading || (data?.perks && data.perks.length > 0)) && (
            <>
              <Divider />
              <Box py={6}>
                <Heading size='md' mb={4}>
                  포함 사항
                </Heading>
                {isLoading ? (
                  <SkeletonText noOfLines={3} />
                ) : (
                  <VStack align='start' spacing={3}>
                    {data?.perks.map((perk) => (
                      <HStack key={perk.pk} align='start' spacing={3}>
                        <Box mt={1} color='green.500'>
                          <FaCheckCircle />
                        </Box>
                        <Box>
                          <Text fontWeight='semibold'>{perk.name}</Text>
                          {perk.detail && (
                            <Text fontSize='sm' color='gray.500'>
                              {perk.detail}
                            </Text>
                          )}
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            </>
          )}
          {/* 리뷰 */}
          <Divider mb={6} />
          <Box>
            {isLoading ? (
              <Skeleton height="28px" w="40%" mb={6} />
            ) : (
              <HStack spacing={2} mb={6} justifyContent="space-between">
                <HStack spacing={2}>
                  {typeof data?.rating === "number" && (
                    <FaStar color="#4299E1" />
                  )}
                  <Heading size="md">
                    {typeof data?.rating === "number" ? `${data.rating} · ` : ""}
                    후기 {reviewsData?.count ?? 0}개
                  </Heading>
                </HStack>
                {!data?.is_owner && hasExperienceBooking && (
                  <Button size="sm" colorScheme="blue" variant="outline" onClick={onReviewOpen}>
                    리뷰 작성
                  </Button>
                )}
              </HStack>
            )}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
              {isReviewsLoading
                ? [1, 2, 3, 4].map((i) => (
                    <Box key={i}>
                      <HStack mb={3}>
                        <SkeletonCircle size="10" />
                        <VStack alignItems="flex-start" spacing={1}>
                          <Skeleton w="120px" h="16px" />
                          <Skeleton w="60px" h="12px" />
                        </VStack>
                      </HStack>
                      <SkeletonText noOfLines={3} spacing={2} />
                    </Box>
                  ))
                : reviews.map((review, index) => (
                    <Box key={index}>
                      <HStack spacing={3} mb={3} alignItems="flex-start">
                        <Link to={`/users/${review.user.username}`}>
                          <Avatar
                            name={review.user.name}
                            src={review.user.avatar}
                            size="md"
                            flexShrink={0}
                            cursor="pointer"
                          />
                        </Link>
                        <VStack alignItems="flex-start" spacing={0} minW={0}>
                          <HStack justify="space-between" w="100%">
                            <Link to={`/users/${review.user.username}`}>
                              <Heading fontSize="sm" noOfLines={1} _hover={{ textDecoration: "underline" }}>
                                {review.user.name || ""}
                              </Heading>
                            </Link>
                            <Text fontSize="xs" color="gray.400">
                              ID {review.user.public_id?.slice(0, 8)}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {new Date(review.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <FaStar size={11} color="#4299E1" />
                            <Text fontSize="sm" color="gray.500">
                              {review.rating}
                            </Text>
                            {user?.username === review.user.username && (
                              <>
                                <Button
                                  size='xs'
                                  variant='ghost'
                                  onClick={() => {
                                    setEditingReview(review);
                                    editReviewReset({
                                      payload: review.payload,
                                      rating: review.rating,
                                    });
                                    onEditReviewOpen();
                                  }}
                                >
                                  수정
                                </Button>
                                <Button
                                  size='xs'
                                  variant='ghost'
                                  colorScheme='blue'
                                  onClick={() => {
                                    setDeletingReviewPk(review.pk);
                                    onDeleteReviewOpen();
                                  }}
                                >
                                  삭제
                                </Button>
                              </>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" lineHeight={1.7}>
                        {review.payload}
                      </Text>
                    </Box>
                  ))}
            </Grid>
            <Pagination
              currentPage={reviewPage}
              totalCount={reviewsData?.count ?? 0}
              pageSize={5}
              onPageChange={setReviewPage}
            />
          </Box>
        </GridItem>

        {/* 예약 카드 */}
        <GridItem>
          <Box position='sticky' top='100px'>
            {isLoading ? (
              <SkeletonText noOfLines={5} />
            ) : (
              <VStack align='start' spacing={0} w='100%'>
                {/* 가격 헤더 */}
                <Box mb={4}>
                  <Text fontSize='xl' fontWeight='bold'>
                    1인당 ₩{data?.price.toLocaleString()} 부터
                  </Text>
                  <Text fontSize='sm' color='blue.400'>
                    취소 수수료 없음
                  </Text>
                </Box>

                {!data?.is_owner && (
                  <>
                    {/* 슬롯 목록 */}
                    <VStack w='100%' spacing={3} align='stretch'>
                      {(showAllSlots
                        ? availableSlots
                        : availableSlots.slice(0, 5)
                      ).map((slot) => {
                        const isSelected = selectedDate === slot.dateStr;
                        return (
                          <Box
                            key={slot.dateStr}
                            borderWidth={isSelected ? 2 : 1}
                            borderColor={isSelected ? "blue.400" : "gray.200"}
                            rounded='xl'
                            p={4}
                            cursor={slot.booked ? "not-allowed" : "pointer"}
                            opacity={slot.booked ? 0.4 : 1}
                            bg={isSelected ? "blue.50" : undefined}
                            _dark={{
                              borderColor: isSelected ? "blue.300" : "gray.600",
                              bg: isSelected ? "blue.900" : undefined,
                            }}
                            onClick={() => {
                              if (!slot.booked) {
                                setSelectedDate(
                                  isSelected ? null : slot.dateStr,
                                );
                                setGuests(1);
                              }
                            }}
                            _hover={
                              slot.booked
                                ? {}
                                : {
                                    borderColor: "blue.300",
                                    bg: "gray.50",
                                    _dark: { bg: "gray.700" },
                                  }
                            }
                            transition='all 0.15s'
                          >
                            <Flex justify='space-between' align='center'>
                              <Box>
                                <Text fontWeight='bold' fontSize='sm'>
                                  {slot.label}
                                  {slot.dayLabel ? `(${slot.dayLabel})` : ""}
                                </Text>
                                <HStack spacing={1} mt={1}>
                                  <FaClock size={11} />
                                  <Text fontSize='sm' color='gray.500'>
                                    {data?.start} ~ {data?.end}
                                  </Text>
                                </HStack>
                              </Box>
                              <HStack spacing={2}>
                                {isSelected && (
                                  <Box
                                    w='18px'
                                    h='18px'
                                    rounded='full'
                                    bg='blue.400'
                                    display='flex'
                                    alignItems='center'
                                    justifyContent='center'
                                    flexShrink={0}
                                  >
                                    <Text
                                      fontSize='10px'
                                      color='white'
                                      fontWeight='bold'
                                    >
                                      ✓
                                    </Text>
                                  </Box>
                                )}
                                <Text
                                  fontSize='sm'
                                  color={
                                    slot.remaining <= 3 && !slot.booked
                                      ? "orange.500"
                                      : "gray.500"
                                  }
                                  flexShrink={0}
                                >
                                  {slot.booked
                                    ? "마감"
                                    : `${slot.remaining}자리 남음`}
                                </Text>
                              </HStack>
                            </Flex>

                            {/* 선택 시 인원 + 예약 버튼 인라인 표시 */}
                            {isSelected && (
                              <Box
                                mt={4}
                                pt={4}
                                borderTop='1px'
                                borderColor='blue.200'
                                _dark={{ borderColor: "blue.700" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FormControl mb={3}>
                                  <FormLabel fontSize='sm'>
                                    인원 (최대 {slot.remaining}명)
                                  </FormLabel>
                                  <NumberInput
                                    min={1}
                                    max={slot.remaining}
                                    value={guests}
                                    onChange={(_, val) => setGuests(val)}
                                    size='sm'
                                  >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </FormControl>
                                <Button
                                  isLoading={bookingMutation.isPending}
                                  w='100%'
                                  colorScheme='blue'
                                  size='md'
                                  rounded='xl'
                                  onClick={onBooking}
                                >
                                  예약하기
                                </Button>
                                <Text
                                  textAlign='center'
                                  mt={2}
                                  fontSize='xs'
                                  color='gray.500'
                                >
                                  아직 요금이 청구되지 않습니다
                                </Text>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>

                    {/* 모든 날짜 보기 / 접기 버튼 */}
                    {availableSlots.length > 5 && (
                      <Button
                        mt={3}
                        w='100%'
                        variant='outline'
                        size='sm'
                        onClick={() => setShowAllSlots((v) => !v)}
                      >
                        {showAllSlots
                          ? "접기"
                          : `모든 날짜 보기 (${availableSlots.length}개)`}
                      </Button>
                    )}
                  </>
                )}
              </VStack>
            )}
          </Box>
        </GridItem>
      </Grid>

      {/* 라이트박스 */}
      <Modal
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        size='full'
        isCentered
      >
        <ModalOverlay bg='blackAlpha.900' />
        <ModalContent bg='transparent' boxShadow='none' m={0}>
          <Flex
            h='100vh'
            w='100vw'
            alignItems='center'
            justifyContent='center'
            position='relative'
            onClick={closeLightbox}
          >
            {/* 닫기 버튼 */}
            <IconButton
              aria-label='Close'
              icon={
                <Text fontSize='xl' fontWeight='bold' color='white'>
                  ✕
                </Text>
              }
              position='absolute'
              top={4}
              right={4}
              variant='ghost'
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              zIndex={10}
            />

            {/* 사진 번호 */}
            <Text
              position='absolute'
              top={5}
              left='50%'
              transform='translateX(-50%)'
              color='white'
              fontSize='sm'
              fontWeight='medium'
              zIndex={10}
            >
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {photos.length}
            </Text>

            {/* 이전 버튼 */}
            <IconButton
              aria-label='Previous'
              icon={
                <Text fontSize='2xl' color='white'>
                  ‹
                </Text>
              }
              position='absolute'
              left={{ base: 2, md: 6 }}
              variant='ghost'
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              isDisabled={lightboxIndex === 0}
              zIndex={10}
              size='lg'
            />

            {/* 사진 */}
            {lightboxIndex !== null && photos[lightboxIndex] && (
              <Image
                src={photos[lightboxIndex].file!}
                maxH='90vh'
                maxW='90vw'
                objectFit='contain'
                rounded='md'
                draggable={false}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* 다음 버튼 */}
            <IconButton
              aria-label='Next'
              icon={
                <Text fontSize='2xl' color='white'>
                  ›
                </Text>
              }
              position='absolute'
              right={{ base: 2, md: 6 }}
              variant='ghost'
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              isDisabled={lightboxIndex === photos.length - 1}
              zIndex={10}
              size='lg'
            />
          </Flex>
        </ModalContent>
      </Modal>

      {/* 리뷰 작성 모달 */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={reviewHandleSubmit(onReviewSubmit)}>
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
                  placeholder="체험에 대한 솔직한 후기를 남겨주세요"
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onReviewClose}>
              취소
            </Button>
            <Button type="submit" colorScheme="blue" isLoading={reviewMutation.isPending}>
              등록
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditReviewOpen} onClose={onEditReviewClose}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={editReviewHandleSubmit((data) => editReviewMutation.mutate(data))}>
          <ModalHeader>리뷰 수정</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>별점</FormLabel>
                <NumberInput min={1} max={5}>
                  <NumberInputField
                    {...editReviewRegister("rating", {
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
                  {...editReviewRegister("payload", { required: true })}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onEditReviewClose}>
              취소
            </Button>
            <Button type='submit' colorScheme='blue' isLoading={editReviewMutation.isPending}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteReviewOpen}
        leastDestructiveRef={deleteReviewRef}
        onClose={onDeleteReviewClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>리뷰 삭제</AlertDialogHeader>
            <AlertDialogBody>정말로 이 리뷰를 삭제하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteReviewRef} onClick={onDeleteReviewClose}>
                취소
              </Button>
              <Button
                colorScheme='blue'
                ml={3}
                isLoading={deleteReviewMutation.isPending}
                onClick={() => {
                  if (deletingReviewPk !== null) {
                    deleteReviewMutation.mutate(deletingReviewPk);
                  }
                }}
              >
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>체험 삭제</AlertDialogHeader>
            <AlertDialogBody>
              정말로 이 체험을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                취소
              </Button>
              <Button
                colorScheme='blue'
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
