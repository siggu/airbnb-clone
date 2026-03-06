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
} from "../api";
import type { ICreateExperienceBookingVariables } from "../api";
import { IExperienceDetail, IWishlist } from "../types";
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
  ModalContent,
  ModalOverlay,
  Skeleton,
  SkeletonText,
  Text,
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
} from "react-icons/fa";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import useUser from "../lib/useUser";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { getErrorDetail } from "../lib/getErrorDetail";

export default function ExperienceDetail() {
  const { experiencePk } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
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

  const photos = data?.photos ?? [];

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
                    src={photo.file}
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
                <Avatar
                  name={data?.host.name}
                  src={data?.host.avatar}
                  size='md'
                />
                <Box>
                  <Text fontWeight='bold'>
                    {data?.host.name} 님이 진행하는 체험
                  </Text>
                  <Text fontSize='sm' color='gray.400'>
                    @{data?.host.username}
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
              <Divider mb={6} />
              <Box>
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
                  <Text fontSize='sm' color='red.400'>
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
                            borderColor={isSelected ? "red.400" : "gray.200"}
                            rounded='xl'
                            p={4}
                            cursor={slot.booked ? "not-allowed" : "pointer"}
                            opacity={slot.booked ? 0.4 : 1}
                            bg={isSelected ? "red.50" : undefined}
                            _dark={{
                              borderColor: isSelected ? "red.300" : "gray.600",
                              bg: isSelected ? "red.900" : undefined,
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
                                    borderColor: "red.300",
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
                                    bg='red.400'
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
                                borderColor='red.200'
                                _dark={{ borderColor: "red.700" }}
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
                                  colorScheme='red'
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
                src={photos[lightboxIndex].file}
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
