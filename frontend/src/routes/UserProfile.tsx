import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getPublicUser,
  getUserRooms,
  getUserReviews,
  getUserExperiences,
  getWishlists,
  getBookings,
  cancelBooking,
  createReview,
  updateReview,
  deleteReview,
  createWishlist,
  toggleWishlistRoom,
  toggleWishlistExperience,
  changePassword,
  updateProfile,
} from "../api";
import type { ICreateReviewVariables, IChangePasswordVariables, IUpdateProfileVariables } from "../api";
import {
  IPublicUser,
  IRoomList,
  IReview,
  IExperienceList,
  IWishlist,
  IBooking,
} from "../types";
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
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Image,
  Input,
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
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  FaStar,
  FaCalendarAlt,
  FaHeart,
  FaCamera,
  FaEdit,
} from "react-icons/fa";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Room from "../components/Room";
import Experience from "../components/Experience";
import useUser from "../lib/useUser";
import { getErrorDetail } from "../lib/getErrorDetail";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getNights(checkIn: string, checkOut: string) {
  return Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function getStatus(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return { label: "예약 확정", color: "green" };
  const now = new Date();
  if (now < new Date(checkIn)) return { label: "예약 확정", color: "green" };
  if (now <= new Date(checkOut)) return { label: "진행 중", color: "blue" };
  return { label: "완료", color: "gray" };
}

export default function UserProfile() {
  const { username } = useParams();
  const { user: me } = useUser();
  const isMyProfile = me?.username === username;
  const queryClient = useQueryClient();
  const toast = useToast();

  // 공통 데이터
  const { data: user, isLoading: isUserLoading } = useQuery<IPublicUser>({
    queryKey: ["publicUser", username],
    queryFn: getPublicUser,
  });
  const { data: rooms, isLoading: isRoomsLoading } = useQuery<IRoomList[]>({
    queryKey: ["userRooms", username],
    queryFn: getUserRooms,
  });
  const { data: reviews, isLoading: isReviewsLoading } = useQuery<IReview[]>({
    queryKey: ["userReviews", username],
    queryFn: getUserReviews,
  });
  const { data: experiences, isLoading: isExperiencesLoading } = useQuery<
    IExperienceList[]
  >({
    queryKey: ["userExperiences", username],
    queryFn: getUserExperiences,
  });

  // 내 프로필 전용
  const { data: wishlists, isLoading: isWishlistsLoading } = useQuery<
    IWishlist[]
  >({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isMyProfile,
  });
  const { data: bookings, isLoading: isBookingsLoading } = useQuery<IBooking[]>(
    {
      queryKey: ["bookings"],
      queryFn: getBookings,
      enabled: isMyProfile,
    },
  );

  const wishlistedRoomPks = new Set(
    wishlists?.flatMap((w) => w.rooms.map((r) => r.pk)) ?? [],
  );
  const wishlistedExpPks = new Set(
    wishlists?.flatMap((w) => (w.experiences ?? []).map((e) => e.pk)) ?? [],
  );
  const getWishlistPk = () => wishlists?.[0]?.pk;

  const roomToggleMutation = useMutation({
    mutationFn: async (roomPk: number) => {
      const wPk = getWishlistPk();
      if (!wPk) {
        const nw = await createWishlist("내 위시리스트");
        return toggleWishlistRoom(nw.pk, roomPk);
      }
      return toggleWishlistRoom(wPk, roomPk);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  const expToggleMutation = useMutation({
    mutationFn: async (expPk: number) => {
      const wPk = getWishlistPk();
      if (!wPk) {
        const nw = await createWishlist("내 위시리스트");
        return toggleWishlistExperience(nw.pk, expPk);
      }
      return toggleWishlistExperience(wPk, expPk);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  // 예약 취소
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const cancelMutation = useMutation({
    mutationFn: (pk: number) => cancelBooking(pk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "예약이 취소되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 3000,
      });
      onCancelClose();
    },
    onError: (error: any) => {
      toast({
        title: "취소에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
      onCancelClose();
    },
  });

  // 리뷰 작성
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const [reviewBooking, setReviewBooking] = useState<IBooking | null>(null);
  const {
    register: reviewRegister,
    handleSubmit: reviewHandleSubmit,
    reset: reviewReset,
  } = useForm<ICreateReviewVariables>();
  const reviewMutation = useMutation({
    mutationFn: (variables: ICreateReviewVariables) =>
      createReview(String(reviewBooking?.room?.pk), variables),
    onSuccess: () => {
      toast({
        title: "리뷰가 등록되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["userReviews", username] });
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

  // 리뷰 수정
  const {
    isOpen: isEditReviewOpen,
    onOpen: onEditReviewOpen,
    onClose: onEditReviewClose,
  } = useDisclosure();
  const [editingReview, setEditingReview] = useState<IReview | null>(null);
  const {
    register: editReviewRegister,
    handleSubmit: editReviewHandleSubmit,
    reset: editReviewReset,
  } = useForm<ICreateReviewVariables>();
  const editReviewMutation = useMutation({
    mutationFn: (variables: ICreateReviewVariables) =>
      updateReview(editingReview!.pk, variables),
    onSuccess: () => {
      toast({ title: "리뷰가 수정되었습니다.", status: "success", position: "bottom-right" });
      queryClient.invalidateQueries({ queryKey: ["userReviews", username] });
      editReviewReset();
      onEditReviewClose();
    },
    onError: (error: any) => {
      toast({
        title: "수정에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // 리뷰 삭제
  const {
    isOpen: isDeleteReviewOpen,
    onOpen: onDeleteReviewOpen,
    onClose: onDeleteReviewClose,
  } = useDisclosure();
  const [deletingReviewPk, setDeletingReviewPk] = useState<number | null>(null);
  const deleteReviewRef = useRef<HTMLButtonElement>(null);
  const deleteReviewMutation = useMutation({
    mutationFn: (pk: number) => deleteReview(pk),
    onSuccess: () => {
      toast({ title: "리뷰가 삭제되었습니다.", status: "success", position: "bottom-right" });
      queryClient.invalidateQueries({ queryKey: ["userReviews", username] });
      onDeleteReviewClose();
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

  // 프로필 수정
  const {
    register: profileRegister,
    handleSubmit: profileHandleSubmit,
    reset: profileReset,
  } = useForm<IUpdateProfileVariables>();
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast({
        title: "프로필이 수정되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["publicUser", username] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      profileReset({ name: data.name, email: data.email, avatar: data.avatar });
    },
    onError: (error: any) => {
      toast({
        title: "프로필 수정에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // 비밀번호 변경
  const {
    register: pwRegister,
    handleSubmit: pwHandleSubmit,
    reset: pwReset,
  } = useForm<IChangePasswordVariables>();
  const pwMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: "비밀번호가 변경되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 3000,
      });
      pwReset();
    },
    onError: (error: any) => {
      toast({
        title: "비밀번호 변경에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const allWishlistRooms = wishlists?.flatMap((w) => w.rooms) ?? [];
  const allWishlistExps = wishlists?.flatMap((w) => w.experiences ?? []) ?? [];

  return (
    <Box mt={10} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{user ? `${user.name} — Airbnb clone` : "프로필"}</title>
      </Helmet>

      {/* 프로필 헤더 */}
      <HStack spacing={6} mb={8} align='center'>
        {isUserLoading ? (
          <>
            <SkeletonCircle size='24' />
            <VStack align='start' spacing={2}>
              <Skeleton height='30px' width='200px' />
              <Skeleton height='18px' width='150px' />
            </VStack>
          </>
        ) : (
          <>
            <Avatar name={user?.name} src={user?.avatar} size='xl' />
            <VStack align='start' spacing={1}>
              <Heading fontSize='2xl'>{user?.name}</Heading>
              <Text color='gray.500'>@{user?.username}</Text>
              <Text fontSize='sm' color='gray.400'>
                가입일:{" "}
                {user?.date_joined
                  ? new Date(user.date_joined).toLocaleDateString("ko-KR")
                  : ""}
              </Text>
            </VStack>
          </>
        )}
      </HStack>

      <Divider mb={6} />

      {isMyProfile ? (
        /* ─── 내 프로필: 탭 UI ─── */
        <Tabs colorScheme='red' isLazy>
          <TabList mb={6} flexWrap='wrap' gap={1}>
            <Tab>숙소</Tab>
            <Tab>체험</Tab>
            <Tab>위시리스트</Tab>
            <Tab>예약 내역</Tab>
            <Tab>작성한 후기</Tab>
            <Tab>프로필 수정</Tab>
            <Tab>비밀번호 변경</Tab>
          </TabList>

          <TabPanels>
            {/* ─ 숙소 탭 ─ */}
            <TabPanel p={0}>
              <HStack justify='space-between' mb={4}>
                <Heading size='md'>
                  {isRoomsLoading ? (
                    <Skeleton height='20px' width='120px' />
                  ) : (
                    `등록한 숙소 (${rooms?.length ?? 0})`
                  )}
                </Heading>
                <Link to='/rooms/upload'>
                  <Button size='sm' colorScheme='red' variant='outline'>
                    + 숙소 등록
                  </Button>
                </Link>
              </HStack>
              {isRoomsLoading ? (
                <Grid
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  }}
                  gap={6}
                >
                  {[0, 1, 2].map((i) => (
                    <Box key={i}>
                      <Skeleton height='200px' rounded='xl' mb={3} />
                      <SkeletonText noOfLines={2} />
                    </Box>
                  ))}
                </Grid>
              ) : rooms && rooms.length > 0 ? (
                <Grid
                  columnGap={4}
                  rowGap={8}
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                    "2xl": "repeat(5, 1fr)",
                  }}
                >
                  {rooms.map((room) => (
                    <Box key={room.pk} position='relative'>
                      <Room
                        pk={room.pk}
                        isOwner={false}
                        imageUrl={room.photos[0]?.file ?? ""}
                        name={room.name}
                        rating={room.rating}
                        city={room.city}
                        country={room.country}
                        price={room.price}
                      />
                      <HStack
                        position='absolute'
                        top={3}
                        right={3}
                        zIndex={1}
                        spacing={1}
                      >
                        <Link to={`/rooms/${room.pk}/edit`}>
                          <Button
                            size='xs'
                            variant='unstyled'
                            color='white'
                            display='flex'
                            alignItems='center'
                            _hover={{ color: "gray.200" }}
                          >
                            <FaEdit size={20} />
                          </Button>
                        </Link>
                        <Link to={`/rooms/${room.pk}/photos`}>
                          <Button
                            size='xs'
                            variant='unstyled'
                            color='white'
                            display='flex'
                            alignItems='center'
                            _hover={{ color: "gray.200" }}
                          >
                            <FaCamera size={20} />
                          </Button>
                        </Link>
                      </HStack>
                    </Box>
                  ))}
                </Grid>
              ) : (
                <VStack minH='20vh' justify='center' spacing={3}>
                  <Text color='gray.400'>등록한 숙소가 없습니다.</Text>
                  <Link to='/rooms/upload'>
                    <Button colorScheme='red' size='sm'>
                      숙소 등록하기
                    </Button>
                  </Link>
                </VStack>
              )}
            </TabPanel>

            {/* ─ 체험 탭 ─ */}
            <TabPanel p={0}>
              <HStack justify='space-between' mb={4}>
                <Heading size='md'>
                  {isExperiencesLoading ? (
                    <Skeleton height='20px' width='120px' />
                  ) : (
                    `등록한 체험 (${experiences?.length ?? 0})`
                  )}
                </Heading>
                <Link to='/experiences/upload'>
                  <Button size='sm' colorScheme='red' variant='outline'>
                    + 체험 등록
                  </Button>
                </Link>
              </HStack>
              {isExperiencesLoading ? (
                <Grid
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {[0, 1, 2].map((i) => (
                    <Box key={i}>
                      <Skeleton height='120px' rounded='xl' mb={3} />
                      <SkeletonText noOfLines={2} />
                    </Box>
                  ))}
                </Grid>
              ) : experiences && experiences.length > 0 ? (
                <Grid
                  columnGap={4}
                  rowGap={6}
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                >
                  {experiences.map((exp) => (
                    <Box key={exp.pk} position='relative'>
                      <Link to={`/experiences/${exp.pk}`}>
                        <Box
                          p={4}
                          borderWidth={1}
                          rounded='xl'
                          _hover={{ shadow: "md", borderColor: "gray.400" }}
                          transition='all 0.2s'
                        >
                          <HStack justify='space-between' mb={1}>
                            <Heading fontSize='md' noOfLines={1}>
                              {exp.name}
                            </Heading>
                            <Text fontSize='sm' color='gray.500'>
                              ₩{exp.price.toLocaleString()}
                            </Text>
                          </HStack>
                          <Text fontSize='sm' color='gray.500'>
                            {exp.city}, {exp.country}
                          </Text>
                          <Text fontSize='xs' color='gray.400' mt={1}>
                            {exp.start} ~ {exp.end}
                          </Text>
                        </Box>
                      </Link>
                      <HStack
                        position='absolute'
                        bottom={3}
                        right={3}
                        zIndex={1}
                        spacing={2}
                      >
                        <Link to={`/experiences/${exp.pk}/edit`}>
                          <Button
                            size='xs'
                            variant='unstyled'
                            color='gray.400'
                            display='flex'
                            alignItems='center'
                            _hover={{ color: "gray.700" }}
                          >
                            <FaEdit size={16} />
                          </Button>
                        </Link>
                        <Link to={`/experiences/${exp.pk}/photos`}>
                          <Button
                            size='xs'
                            variant='unstyled'
                            color='gray.400'
                            display='flex'
                            alignItems='center'
                            _hover={{ color: "gray.700" }}
                          >
                            <FaCamera size={16} />
                          </Button>
                        </Link>
                      </HStack>
                    </Box>
                  ))}
                </Grid>
              ) : (
                <VStack minH='20vh' justify='center' spacing={3}>
                  <Text color='gray.400'>등록한 체험이 없습니다.</Text>
                  <Link to='/experiences/upload'>
                    <Button colorScheme='red' size='sm'>
                      체험 등록하기
                    </Button>
                  </Link>
                </VStack>
              )}
            </TabPanel>

            {/* ─ 위시리스트 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={4}>
                위시리스트
              </Heading>
              {isWishlistsLoading ? (
                <Grid
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {[0, 1, 2].map((i) => (
                    <Box key={i}>
                      <Skeleton height='200px' rounded='xl' mb={3} />
                      <SkeletonText noOfLines={2} />
                    </Box>
                  ))}
                </Grid>
              ) : allWishlistRooms.length === 0 &&
                allWishlistExps.length === 0 ? (
                <VStack minH='20vh' justify='center' spacing={2}>
                  <FaHeart size={36} color='#CBD5E0' />
                  <Text color='gray.400' mt={2}>
                    저장한 항목이 없습니다.
                  </Text>
                  <Text fontSize='sm' color='gray.400'>
                    마음에 드는 숙소나 체험의 하트를 눌러 저장해보세요.
                  </Text>
                </VStack>
              ) : (
                <VStack align='stretch' spacing={10}>
                  {allWishlistRooms.length > 0 && (
                    <Box>
                      <Heading size='sm' mb={4} color='gray.600'>
                        숙소 ({allWishlistRooms.length})
                      </Heading>
                      <Grid
                        columnGap={4}
                        rowGap={8}
                        templateColumns={{
                          sm: "1fr",
                          md: "repeat(2, 1fr)",
                          lg: "repeat(3, 1fr)",
                          xl: "repeat(4, 1fr)",
                        }}
                      >
                        {allWishlistRooms.map((room) => (
                          <Room
                            key={room.pk}
                            pk={room.pk}
                            isOwner={room.is_owner}
                            imageUrl={room.photos[0]?.file ?? ""}
                            name={room.name}
                            rating={room.rating}
                            city={room.city}
                            country={room.country}
                            price={room.price}
                            isWishlisted={wishlistedRoomPks.has(room.pk)}
                            onToggleWishlist={() =>
                              roomToggleMutation.mutate(room.pk)
                            }
                          />
                        ))}
                      </Grid>
                    </Box>
                  )}
                  {allWishlistExps.length > 0 && (
                    <Box>
                      <Heading size='sm' mb={4} color='gray.600'>
                        체험 ({allWishlistExps.length})
                      </Heading>
                      <Grid
                        columnGap={4}
                        rowGap={8}
                        templateColumns={{
                          sm: "1fr",
                          md: "repeat(2, 1fr)",
                          lg: "repeat(3, 1fr)",
                          xl: "repeat(4, 1fr)",
                        }}
                      >
                        {allWishlistExps.map((exp) => (
                          <Experience
                            key={exp.pk}
                            pk={exp.pk}
                            name={exp.name}
                            city={exp.city}
                            country={exp.country}
                            price={exp.price}
                            start={exp.start}
                            end={exp.end}
                            isWishlisted={wishlistedExpPks.has(exp.pk)}
                            onToggleWishlist={() =>
                              expToggleMutation.mutate(exp.pk)
                            }
                          />
                        ))}
                      </Grid>
                    </Box>
                  )}
                </VStack>
              )}
            </TabPanel>

            {/* ─ 예약 내역 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={4}>
                예약 내역
              </Heading>
              {isBookingsLoading ? (
                <VStack spacing={4} align='stretch'>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} borderWidth={1} rounded='xl' p={4}>
                      <HStack spacing={4}>
                        <Skeleton w='120px' h='90px' rounded='lg' />
                        <VStack align='start' flex={1} spacing={2}>
                          <Skeleton h='20px' w='60%' />
                          <SkeletonText noOfLines={2} w='80%' />
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : !bookings || bookings.length === 0 ? (
                <VStack minH='20vh' justify='center' spacing={2}>
                  <FaCalendarAlt size={36} color='#CBD5E0' />
                  <Text color='gray.400' mt={2}>
                    예약 내역이 없습니다.
                  </Text>
                </VStack>
              ) : (
                (() => {
                  const reviewedRoomPks = new Set(
                    reviews?.filter((r) => r.room_pk).map((r) => r.room_pk!) ??
                      [],
                  );
                  const renderBookingCard = (booking: IBooking) => {
                    const isRoom = booking.kind === "room";
                    const nights =
                      booking.check_in && booking.check_out
                        ? getNights(booking.check_in, booking.check_out)
                        : 0;
                    const status = getStatus(
                      booking.check_in,
                      booking.check_out,
                    );
                    const room = booking.room;
                    const experience = booking.experience;
                    const name = isRoom ? room?.name : experience?.name;
                    const city = isRoom ? room?.city : experience?.city;
                    const country = isRoom
                      ? room?.country
                      : experience?.country;
                    const photo = isRoom
                      ? room?.photos?.[0]?.file
                      : experience?.photos?.[0]?.file;
                    const linkTo = isRoom
                      ? `/rooms/${room?.pk}`
                      : `/experiences/${experience?.pk}`;
                    return (
                      <Box
                        key={booking.pk}
                        borderWidth={1}
                        rounded='xl'
                        overflow='hidden'
                        p={4}
                        _hover={{ shadow: "md", borderColor: "gray.400" }}
                        transition='all 0.2s'
                      >
                        <HStack spacing={4} align='start'>
                          <Link to={linkTo}>
                            <Image
                              src={photo ?? ""}
                              w='120px'
                              h='90px'
                              objectFit='cover'
                              rounded='lg'
                              flexShrink={0}
                              bg='gray.200'
                              fallback={
                                <Box
                                  w='120px'
                                  h='90px'
                                  bg='gray.200'
                                  rounded='lg'
                                />
                              }
                            />
                          </Link>
                          <VStack align='start' spacing={1} flex={1}>
                            <HStack justify='space-between' w='100%'>
                              <HStack spacing={2}>
                                <Link to={linkTo}>
                                  <Text
                                    fontWeight='bold'
                                    fontSize='md'
                                    noOfLines={1}
                                    _hover={{ textDecoration: "underline" }}
                                  >
                                    {name}
                                  </Text>
                                </Link>
                                <Badge
                                  colorScheme={isRoom ? "blue" : "purple"}
                                  px={2}
                                  py={0.5}
                                  rounded='md'
                                  fontSize='xs'
                                >
                                  {isRoom ? "숙소" : "체험"}
                                </Badge>
                              </HStack>
                              <Badge
                                colorScheme={status.color}
                                px={2}
                                py={1}
                                rounded='md'
                              >
                                {status.label}
                              </Badge>
                            </HStack>
                            <Text fontSize='sm' color='gray.500'>
                              {city}, {country}
                            </Text>
                            <Divider my={1} />
                            <HStack spacing={4} fontSize='sm' flexWrap='wrap'>
                              <Text>
                                <Text as='span' fontWeight='semibold'>
                                  {isRoom ? "체크인" : "날짜"}
                                </Text>{" "}
                                {booking.check_in
                                  ? formatDate(booking.check_in)
                                  : "-"}
                                {!isRoom && booking.check_out && booking.check_in !== booking.check_out && (
                                  <> ~ {formatDate(booking.check_out)}</>
                                )}
                              </Text>
                              {!isRoom && (
                                <Text>
                                  <Text as='span' fontWeight='semibold'>시간</Text>{" "}
                                  {booking.check_in_time ?? "-"} ~ {booking.check_out_time ?? "-"}
                                </Text>
                              )}
                              {isRoom && (
                                <>
                                  <Text color='gray.400'>→</Text>
                                  <Text>
                                    <Text as='span' fontWeight='semibold'>체크아웃</Text>{" "}
                                    {booking.check_out ? formatDate(booking.check_out) : "-"}
                                  </Text>
                                </>
                              )}
                            </HStack>
                            <HStack spacing={4} fontSize='sm' color='gray.600'>
                              {isRoom && <Text>{nights}박</Text>}
                              {isRoom && <Text>·</Text>}
                              <Text>게스트 {booking.guests}명</Text>
                              {isRoom && room && (
                                <>
                                  <Text>·</Text>
                                  <Text fontWeight='semibold'>
                                    ₩{(room.price * nights).toLocaleString()}
                                  </Text>
                                </>
                              )}
                              {!isRoom && experience && (
                                <>
                                  <Text>·</Text>
                                  <Text fontWeight='semibold'>
                                    ₩
                                    {(
                                      experience.price * booking.guests
                                    ).toLocaleString()}
                                  </Text>
                                </>
                              )}
                            </HStack>
                            <HStack mt={2} spacing={2}>
                              {status.label === "예약 확정" && (
                                <Button
                                  size='sm'
                                  colorScheme='red'
                                  variant='outline'
                                  onClick={() => {
                                    setCancelTarget(booking.pk);
                                    onCancelOpen();
                                  }}
                                >
                                  예약 취소
                                </Button>
                              )}
                              {status.label === "완료" && isRoom && (
                                <Button
                                  size='sm'
                                  colorScheme='red'
                                  isDisabled={reviewedRoomPks.has(room?.pk!)}
                                  onClick={() => {
                                    setReviewBooking(booking);
                                    onReviewOpen();
                                  }}
                                >
                                  {reviewedRoomPks.has(room?.pk!)
                                    ? "리뷰 작성 완료"
                                    : "리뷰 작성"}
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                      </Box>
                    );
                  };

                  const roomBookings = bookings.filter(
                    (b) => b.kind === "room",
                  );
                  const expBookings = bookings.filter((b) => b.kind !== "room");
                  const activeRooms = roomBookings.filter(
                    (b) => getStatus(b.check_in, b.check_out).label !== "완료",
                  );
                  const doneRooms = roomBookings.filter(
                    (b) => getStatus(b.check_in, b.check_out).label === "완료",
                  );
                  const activeExps = expBookings.filter(
                    (b) => getStatus(b.check_in, b.check_out).label !== "완료",
                  );
                  const doneExps = expBookings.filter(
                    (b) => getStatus(b.check_in, b.check_out).label === "완료",
                  );

                  return (
                    <Tabs colorScheme='red' variant='soft-rounded' size='sm'>
                      <TabList mb={4}>
                        <Tab>전체 ({bookings.length})</Tab>
                        <Tab>숙소 ({roomBookings.length})</Tab>
                        <Tab>체험 ({expBookings.length})</Tab>
                      </TabList>
                      <TabPanels>
                        {/* 전체 */}
                        <TabPanel p={0}>
                          {activeRooms.length + activeExps.length > 0 && (
                            <Box mb={6}>
                              <HStack mb={3}>
                                <Text
                                  fontWeight='bold'
                                  fontSize='sm'
                                  color='gray.600'
                                >
                                  진행 중 · 예약 확정
                                </Text>
                              </HStack>
                              <VStack spacing={3} align='stretch'>
                                {[...activeRooms, ...activeExps].map(
                                  renderBookingCard,
                                )}
                              </VStack>
                            </Box>
                          )}
                          {doneRooms.length + doneExps.length > 0 && (
                            <Box>
                              <HStack mb={3}>
                                <Text
                                  fontWeight='bold'
                                  fontSize='sm'
                                  color='gray.400'
                                >
                                  완료
                                </Text>
                              </HStack>
                              <VStack spacing={3} align='stretch'>
                                {[...doneRooms, ...doneExps].map(
                                  renderBookingCard,
                                )}
                              </VStack>
                            </Box>
                          )}
                        </TabPanel>
                        {/* 숙소 */}
                        <TabPanel p={0}>
                          {activeRooms.length > 0 && (
                            <Box mb={6}>
                              <HStack mb={3}>
                                <Text
                                  fontWeight='bold'
                                  fontSize='sm'
                                  color='gray.600'
                                >
                                  진행 중 · 예약 확정
                                </Text>
                              </HStack>
                              <VStack spacing={3} align='stretch'>
                                {activeRooms.map(renderBookingCard)}
                              </VStack>
                            </Box>
                          )}
                          {doneRooms.length > 0 && (
                            <Box>
                              <HStack mb={3}>
                                <Text
                                  fontWeight='bold'
                                  fontSize='sm'
                                  color='gray.400'
                                >
                                  완료 — 리뷰를 남겨보세요
                                </Text>
                              </HStack>
                              <VStack spacing={3} align='stretch'>
                                {doneRooms.map(renderBookingCard)}
                              </VStack>
                            </Box>
                          )}
                          {roomBookings.length === 0 && (
                            <VStack minH='20vh' justify='center'>
                              <Text color='gray.400'>
                                숙소 예약 내역이 없습니다.
                              </Text>
                            </VStack>
                          )}
                        </TabPanel>
                        {/* 체험 */}
                        <TabPanel p={0}>
                          {activeExps.length > 0 && (
                            <Box mb={6}>
                              <HStack mb={3}>
                                <Text
                                  fontWeight='bold'
                                  fontSize='sm'
                                  color='gray.600'
                                >
                                  진행 중 · 예약 확정
                                </Text>
                              </HStack>
                              <VStack spacing={3} align='stretch'>
                                {activeExps.map(renderBookingCard)}
                              </VStack>
                            </Box>
                          )}
                          {doneExps.length > 0 && (
                            <Box>
                              <HStack mb={3}>
                                <Text
                                  fontWeight='bold'
                                  fontSize='sm'
                                  color='gray.400'
                                >
                                  완료
                                </Text>
                              </HStack>
                              <VStack spacing={3} align='stretch'>
                                {doneExps.map(renderBookingCard)}
                              </VStack>
                            </Box>
                          )}
                          {expBookings.length === 0 && (
                            <VStack minH='20vh' justify='center'>
                              <Text color='gray.400'>
                                체험 예약 내역이 없습니다.
                              </Text>
                            </VStack>
                          )}
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  );
                })()
              )}
            </TabPanel>

            {/* ─ 작성한 후기 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={4}>
                {isReviewsLoading ? (
                  <Skeleton height='20px' width='120px' />
                ) : (
                  `작성한 후기 (${reviews?.length ?? 0})`
                )}
              </Heading>
              {isReviewsLoading ? (
                <VStack spacing={4} align='stretch'>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} p={4} borderWidth={1} rounded='xl'>
                      <SkeletonText noOfLines={3} />
                    </Box>
                  ))}
                </VStack>
              ) : reviews && reviews.length > 0 ? (
                <VStack spacing={4} align='stretch'>
                  {reviews.map((review, i) => {
                    const linkTo = review.room_pk
                      ? `/rooms/${review.room_pk}`
                      : review.experience_pk
                        ? `/experiences/${review.experience_pk}`
                        : null;
                    return (
                      <Box
                        key={i}
                        p={4}
                        borderWidth={1}
                        rounded='xl'
                        _hover={{ shadow: "md", borderColor: "gray.300" }}
                        transition='all 0.2s'
                      >
                        <HStack justify='space-between' mb={2}>
                          <HStack spacing={1}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                size={14}
                                color={
                                  star <= review.rating ? "#FF385C" : "#E2E8F0"
                                }
                              />
                            ))}
                            <Text fontSize='sm' ml={1} color='gray.500'>
                              {review.rating}점
                            </Text>
                          </HStack>
                          <HStack spacing={3}>
                            <Text fontSize='xs' color='gray.400'>
                              {new Date(review.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                            </Text>
                            {linkTo && (
                              <Link to={linkTo}>
                                <Text fontSize='xs' color='red.400' _hover={{ textDecoration: "underline" }}>
                                  {review.room_pk ? "숙소 보기" : "체험 보기"} →
                                </Text>
                              </Link>
                            )}
                            <Button
                              size='xs'
                              variant='ghost'
                              colorScheme='gray'
                              onClick={() => {
                                setEditingReview(review);
                                editReviewReset({ payload: review.payload, rating: review.rating });
                                onEditReviewOpen();
                              }}
                            >
                              수정
                            </Button>
                            <Button
                              size='xs'
                              variant='ghost'
                              colorScheme='red'
                              onClick={() => {
                                setDeletingReviewPk(review.pk);
                                onDeleteReviewOpen();
                              }}
                            >
                              삭제
                            </Button>
                          </HStack>
                        </HStack>
                        <Text color='gray.700'>{review.payload}</Text>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <VStack minH='20vh' justify='center'>
                  <Text color='gray.400'>작성한 후기가 없습니다.</Text>
                </VStack>
              )}
            </TabPanel>

            {/* ─ 프로필 수정 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={6}>
                프로필 수정
              </Heading>
              <Box
                maxW='400px'
                as='form'
                onSubmit={profileHandleSubmit((data) => profileMutation.mutate(data))}
              >
                <VStack spacing={5}>
                  <FormControl>
                    <FormLabel>이름</FormLabel>
                    <Input
                      {...profileRegister("name")}
                      defaultValue={user?.name}
                      placeholder='이름을 입력해주세요'
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>이메일</FormLabel>
                    <Input
                      {...profileRegister("email")}
                      defaultValue={user?.email}
                      type='email'
                      placeholder='이메일을 입력해주세요'
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>아바타 URL</FormLabel>
                    <Input
                      {...profileRegister("avatar")}
                      defaultValue={user?.avatar}
                      placeholder='아바타 이미지 URL을 입력해주세요'
                    />
                  </FormControl>
                  <Button
                    type='submit'
                    isLoading={profileMutation.isPending}
                    colorScheme='red'
                    size='lg'
                    w='100%'
                  >
                    저장
                  </Button>
                </VStack>
              </Box>
            </TabPanel>

            {/* ─ 비밀번호 변경 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={6}>
                비밀번호 변경
              </Heading>
              <Box
                maxW='400px'
                as='form'
                onSubmit={pwHandleSubmit((data) => pwMutation.mutate(data))}
              >
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel>현재 비밀번호</FormLabel>
                    <Input
                      {...pwRegister("old_password", { required: true })}
                      type='password'
                      placeholder='현재 비밀번호를 입력해주세요'
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>새 비밀번호</FormLabel>
                    <Input
                      {...pwRegister("new_password", { required: true })}
                      type='password'
                      placeholder='새 비밀번호를 입력해주세요'
                    />
                  </FormControl>
                  <Button
                    type='submit'
                    isLoading={pwMutation.isPending}
                    colorScheme='red'
                    size='lg'
                    w='100%'
                  >
                    비밀번호 변경
                  </Button>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        /* ─── 타인 프로필: 공개 뷰 ─── */
        <VStack align='stretch' spacing={12}>
          <Box>
            <Heading size='md' mb={4}>
              {isRoomsLoading ? (
                <Skeleton height='20px' width='120px' />
              ) : (
                `등록한 숙소 (${rooms?.length ?? 0})`
              )}
            </Heading>
            {isRoomsLoading ? (
              <Grid
                templateColumns={{
                  sm: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={6}
              >
                {[0, 1, 2].map((i) => (
                  <Box key={i}>
                    <Skeleton height='200px' rounded='xl' mb={3} />
                    <SkeletonText noOfLines={2} />
                  </Box>
                ))}
              </Grid>
            ) : rooms && rooms.length > 0 ? (
              <Grid
                columnGap={4}
                rowGap={8}
                templateColumns={{
                  sm: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                }}
              >
                {rooms.map((room) => (
                  <Room
                    key={room.pk}
                    pk={room.pk}
                    isOwner={room.is_owner}
                    imageUrl={room.photos[0]?.file ?? ""}
                    name={room.name}
                    rating={room.rating}
                    city={room.city}
                    country={room.country}
                    price={room.price}
                  />
                ))}
              </Grid>
            ) : (
              <Text color='gray.400'>등록한 숙소가 없습니다.</Text>
            )}
          </Box>

          <Divider />

          <Box>
            <Heading size='md' mb={4}>
              {isExperiencesLoading ? (
                <Skeleton height='20px' width='120px' />
              ) : (
                `등록한 체험 (${experiences?.length ?? 0})`
              )}
            </Heading>
            {isExperiencesLoading ? (
              <Grid
                templateColumns={{
                  sm: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={6}
              >
                {[0, 1, 2].map((i) => (
                  <Box key={i}>
                    <Skeleton height='120px' rounded='xl' mb={3} />
                    <SkeletonText noOfLines={2} />
                  </Box>
                ))}
              </Grid>
            ) : experiences && experiences.length > 0 ? (
              <Grid
                columnGap={4}
                rowGap={6}
                templateColumns={{
                  sm: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
              >
                {experiences.map((exp) => (
                  <Link key={exp.pk} to={`/experiences/${exp.pk}`}>
                    <Box
                      p={4}
                      borderWidth={1}
                      rounded='xl'
                      _hover={{ shadow: "md" }}
                      transition='all 0.2s'
                    >
                      <HStack justify='space-between' mb={1}>
                        <Heading fontSize='md' noOfLines={1}>
                          {exp.name}
                        </Heading>
                        <Text fontSize='sm' color='gray.500'>
                          ₩{exp.price.toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize='sm' color='gray.500'>
                        {exp.city}, {exp.country}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </Grid>
            ) : (
              <Text color='gray.400'>등록한 체험이 없습니다.</Text>
            )}
          </Box>

          <Divider />

          <Box>
            <Heading size='md' mb={4}>
              {isReviewsLoading ? (
                <Skeleton height='20px' width='120px' />
              ) : (
                `작성한 후기 (${reviews?.length ?? 0})`
              )}
            </Heading>
            {isReviewsLoading ? (
              <VStack spacing={4} align='stretch'>
                {[0, 1, 2].map((i) => (
                  <Box key={i} p={4} borderWidth={1} rounded='xl'>
                    <SkeletonText noOfLines={3} />
                  </Box>
                ))}
              </VStack>
            ) : reviews && reviews.length > 0 ? (
              <VStack spacing={4} align='stretch'>
                {reviews.map((review, i) => (
                  <Box key={i} p={4} borderWidth={1} rounded='xl'>
                    <HStack mb={2} spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={14}
                          color={star <= review.rating ? "#FF385C" : "#E2E8F0"}
                        />
                      ))}
                      <Text fontSize='sm' ml={1} color='gray.500'>
                        {review.rating}점
                      </Text>
                    </HStack>
                    <Text color='gray.700'>{review.payload}</Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color='gray.400'>작성한 후기가 없습니다.</Text>
            )}
          </Box>
        </VStack>
      )}

      {/* 예약 취소 다이얼로그 */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              예약 취소
            </AlertDialogHeader>
            <AlertDialogBody>
              정말로 예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCancelClose}>
                닫기
              </Button>
              <Button
                colorScheme='red'
                ml={3}
                isLoading={cancelMutation.isPending}
                onClick={() => {
                  if (cancelTarget !== null)
                    cancelMutation.mutate(cancelTarget);
                }}
              >
                취소하기
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* 리뷰 수정 모달 */}
      <Modal isOpen={isEditReviewOpen} onClose={onEditReviewClose}>
        <ModalOverlay />
        <ModalContent
          as='form'
          onSubmit={editReviewHandleSubmit((data) => editReviewMutation.mutate(data))}
        >
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
            <Button variant='ghost' mr={3} onClick={onEditReviewClose}>취소</Button>
            <Button type='submit' colorScheme='red' isLoading={editReviewMutation.isPending}>
              수정 완료
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 리뷰 삭제 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isDeleteReviewOpen}
        leastDestructiveRef={deleteReviewRef}
        onClose={onDeleteReviewClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>리뷰 삭제</AlertDialogHeader>
            <AlertDialogBody>정말로 이 리뷰를 삭제하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteReviewRef} onClick={onDeleteReviewClose}>닫기</Button>
              <Button
                colorScheme='red'
                ml={3}
                isLoading={deleteReviewMutation.isPending}
                onClick={() => { if (deletingReviewPk !== null) deleteReviewMutation.mutate(deletingReviewPk); }}
              >
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* 리뷰 작성 모달 */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent
          as='form'
          onSubmit={reviewHandleSubmit((data) => reviewMutation.mutate(data))}
        >
          <ModalHeader>리뷰 작성 — {reviewBooking?.room?.name}</ModalHeader>
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
    </Box>
  );
}
