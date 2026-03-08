import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
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
  createExperienceReview,
  createWishlist,
  toggleWishlistRoom,
  toggleWishlistExperience,
  changePassword,
  updateProfile,
  uploadAvatar,
} from "../api";
import type { ICreateReviewVariables, IChangePasswordVariables, IUpdateProfileVariables, IPaginatedResponse } from "../api";
import Pagination from "../components/Pagination";
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
  Flex,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: me } = useUser();
  const isMyProfile = me?.username === username;
  const [myWishlistTab, setMyWishlistTab] = useState(0);
  const [myReviewTab, setMyReviewTab] = useState(0);
  const [publicReviewTab, setPublicReviewTab] = useState(0);
  const [roomsPage, setRoomsPage] = useState(1);
  const [experiencesPage, setExperiencesPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const PROFILE_GRID_COLUMNS = {
    base: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(3, 1fr)",
    xl: "repeat(4, 1fr)",
    "2xl": "repeat(5, 1fr)",
  } as const;

  const MY_TABS = ["rooms", "experiences", "wishlists", "bookings", "reviews", "profile", "password"] as const;
  const currentTab = searchParams.get("tab") ?? "rooms";
  const tabIndex = Math.max(0, MY_TABS.indexOf(currentTab as typeof MY_TABS[number]));
  const handleTabChange = (index: number) => {
    setSearchParams({ tab: MY_TABS[index] });
  };
  const queryClient = useQueryClient();
  const toast = useToast();

  // 공통 데이터
  const { data: user, isLoading: isUserLoading } = useQuery<IPublicUser>({
    queryKey: ["publicUser", username],
    queryFn: getPublicUser,
  });
  const { data: rooms, isLoading: isRoomsLoading } = useQuery<IPaginatedResponse<IRoomList>>({
    queryKey: ["userRooms", username, roomsPage],
    queryFn: getUserRooms,
  });
  const { data: reviews, isLoading: isReviewsLoading } = useQuery<IPaginatedResponse<IReview>>({
    queryKey: ["userReviews", username, reviewsPage],
    queryFn: getUserReviews,
  });
  const { data: experiences, isLoading: isExperiencesLoading } = useQuery<IPaginatedResponse<IExperienceList>>({
    queryKey: ["userExperiences", username, experiencesPage],
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
  const { data: bookings, isLoading: isBookingsLoading } = useQuery<IPaginatedResponse<IBooking>>(
    {
      queryKey: ["bookings", bookingPage],
      queryFn: () => getBookings(bookingPage),
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
      reviewBooking?.room?.pk
        ? createReview(String(reviewBooking.room.pk), variables)
        : createExperienceReview(String(reviewBooking?.experience?.pk), variables),
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

  // 아바타 업로드
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (data) => {
      toast({
        title: "프로필 사진이 변경되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["publicUser", username] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      toast({
        title: "프로필 사진 변경에 실패했습니다.",
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
      profileReset({ name: data.name, bio: data.bio, email: data.email });
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
  const roomReviews = reviews?.results?.filter((r) => Boolean(r.room_pk)) ?? [];
  const experienceReviews = reviews?.results?.filter((r) => Boolean(r.experience_pk)) ?? [];
  const getReviewTargetInfo = (review: IReview) => {
    const bookingMatch = bookings?.results?.find((b) => {
      if (review.room_pk) return b.room?.pk === review.room_pk;
      if (review.experience_pk) return b.experience?.pk === review.experience_pk;
      return false;
    });
    if (review.room_pk) {
      const room = bookingMatch?.room ?? rooms?.results?.find((r) => r.pk === review.room_pk);
      return {
        kind: "room" as const,
        linkTo: `/rooms/${review.room_pk}`,
        name: room?.name ?? `숙소 #${review.room_pk}`,
        city: room?.city,
        country: room?.country,
        price: room?.price,
        imageUrl: room?.thumbnail_url ?? undefined,
      };
    }
    if (review.experience_pk) {
      const experience =
        bookingMatch?.experience ??
        experiences?.results?.find((e) => e.pk === review.experience_pk);
      return {
        kind: "experience" as const,
        linkTo: `/experiences/${review.experience_pk}`,
        name: experience?.name ?? `체험 #${review.experience_pk}`,
        city: experience?.city,
        country: experience?.country,
        price: experience?.price,
        imageUrl: experience?.thumbnail_url ?? undefined,
        schedule:
          experience?.start && experience?.end
            ? `${experience.start} ~ ${experience.end}`
            : null,
      };
    }
    return null;
  };


  return (
    <Box mt={10} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{user ? `${user.name} — StayAI` : "프로필"}</title>
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
              <Text color='gray.500'>{user?.bio || user?.name}</Text>
              <Text fontSize='xs' color='gray.400'>
                사용자 코드: {user?.public_id?.slice(0, 8)}
              </Text>
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
        <Tabs colorScheme='blue' isLazy index={tabIndex} onChange={handleTabChange}>
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
                    `등록한 숙소 (${rooms?.count ?? 0})`
                  )}
                </Heading>
                <Link to='/rooms/upload'>
                  <Button size='sm' colorScheme='blue' variant='outline'>
                    + 숙소 등록
                  </Button>
                </Link>
              </HStack>
              {isRoomsLoading ? (
                <Grid
                  templateColumns={PROFILE_GRID_COLUMNS}
                  gap={6}
                >
                  {[0, 1, 2].map((i) => (
                    <Box key={i}>
                      <Skeleton height='200px' rounded='xl' mb={3} />
                      <SkeletonText noOfLines={2} />
                    </Box>
                  ))}
                </Grid>
              ) : rooms?.results && rooms.results.length > 0 ? (
                <Grid
                  columnGap={4}
                  rowGap={8}
                  templateColumns={PROFILE_GRID_COLUMNS}
                >
                  {(rooms?.results ?? []).map((room) => (
                    <Box key={room.pk} position='relative'>
                      <Room
                        pk={room.pk}
                        isOwner={false}
                        imageUrl={room.thumbnail_url ?? ""}
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
                    <Button colorScheme='blue' size='sm'>
                      숙소 등록하기
                    </Button>
                  </Link>
                </VStack>
              )}
              <Pagination
                currentPage={roomsPage}
                totalCount={rooms?.count ?? 0}
                pageSize={12}
                onPageChange={setRoomsPage}
              />
            </TabPanel>

            {/* ─ 체험 탭 ─ */}
            <TabPanel p={0}>
              <HStack justify='space-between' mb={4}>
                <Heading size='md'>
                  {isExperiencesLoading ? (
                    <Skeleton height='20px' width='120px' />
                  ) : (
                    `등록한 체험 (${experiences?.count ?? 0})`
                  )}
                </Heading>
                <Link to='/experiences/upload'>
                  <Button size='sm' colorScheme='blue' variant='outline'>
                    + 체험 등록
                  </Button>
                </Link>
              </HStack>
              {isExperiencesLoading ? (
                <Grid
                  templateColumns={PROFILE_GRID_COLUMNS}
                  gap={6}
                >
                  {[0, 1, 2].map((i) => (
                    <Box key={i}>
                      <Skeleton height='250px' rounded='2xl' mb={3} />
                      <SkeletonText noOfLines={2} />
                    </Box>
                  ))}
                </Grid>
              ) : experiences?.results && experiences.results.length > 0 ? (
                <Grid
                  columnGap={4}
                  rowGap={8}
                  templateColumns={PROFILE_GRID_COLUMNS}
                >
                  {(experiences?.results ?? []).map((exp) => (
                    <Box key={exp.pk} position='relative'>
                      <Experience
                        pk={exp.pk}
                        name={exp.name}
                        city={exp.city}
                        country={exp.country}
                        price={exp.price}
                        start={exp.start}
                        end={exp.end}
                        imageUrl={exp.thumbnail_url ?? undefined}
                        rating={exp.rating}
                        isOwner={false}
                      />
                      <HStack
                        position='absolute'
                        top={3}
                        right={3}
                        zIndex={1}
                        spacing={1}
                      >
                        <Link to={`/experiences/${exp.pk}/edit`}>
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
                        <Link to={`/experiences/${exp.pk}/photos`}>
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
                  <Text color='gray.400'>등록한 체험이 없습니다.</Text>
                  <Link to='/experiences/upload'>
                    <Button colorScheme='blue' size='sm'>
                      체험 등록하기
                    </Button>
                  </Link>
                </VStack>
              )}
              <Pagination
                currentPage={experiencesPage}
                totalCount={experiences?.count ?? 0}
                pageSize={12}
                onPageChange={setExperiencesPage}
              />
            </TabPanel>

            {/* ─ 위시리스트 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={4}>
                {isWishlistsLoading
                  ? <Skeleton height='20px' width='120px' />
                  : `위시리스트 (${allWishlistRooms.length + allWishlistExps.length})`}
              </Heading>
              {isWishlistsLoading ? (
                <Grid
                  templateColumns={PROFILE_GRID_COLUMNS}
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
                <>
                  <Tabs
                    variant='soft-rounded'
                    colorScheme='blue'
                    size='sm'
                    mb={4}
                    index={myWishlistTab}
                    onChange={setMyWishlistTab}
                  >
                    <TabList>
                      <Tab>전체 ({allWishlistRooms.length + allWishlistExps.length})</Tab>
                      <Tab>숙소 ({allWishlistRooms.length})</Tab>
                      <Tab>체험 ({allWishlistExps.length})</Tab>
                    </TabList>
                  </Tabs>
                <VStack align='stretch' spacing={10}>
                  {(myWishlistTab !== 2 && allWishlistRooms.length > 0) && (
                    <Box>
                      <Heading size='sm' mb={4} color='gray.600'>
                        숙소 ({allWishlistRooms.length})
                      </Heading>
                      <Grid
                        columnGap={4}
                        rowGap={8}
                        templateColumns={PROFILE_GRID_COLUMNS}
                      >
                        {allWishlistRooms.map((room) => (
                          <Room
                            key={room.pk}
                            pk={room.pk}
                            isOwner={room.is_owner}
                            imageUrl={room.thumbnail_url ?? ""}
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
                  {(myWishlistTab !== 1 && allWishlistExps.length > 0) && (
                    <Box>
                      <Heading size='sm' mb={4} color='gray.600'>
                        체험 ({allWishlistExps.length})
                      </Heading>
                      <Grid
                        columnGap={4}
                        rowGap={8}
                        templateColumns={PROFILE_GRID_COLUMNS}
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
                            imageUrl={exp.thumbnail_url ?? undefined}
                            rating={exp.rating}
                            isWishlisted={wishlistedExpPks.has(exp.pk)}
                            onToggleWishlist={() =>
                              expToggleMutation.mutate(exp.pk)
                            }
                          />
                        ))}
                      </Grid>
                    </Box>
                  )}
                  {myWishlistTab === 1 && allWishlistRooms.length === 0 && (
                    <VStack minH='20vh' justify='center'>
                      <Text color='gray.400'>숙소 위시리스트가 없습니다.</Text>
                    </VStack>
                  )}
                  {myWishlistTab === 2 && allWishlistExps.length === 0 && (
                    <VStack minH='20vh' justify='center'>
                      <Text color='gray.400'>체험 위시리스트가 없습니다.</Text>
                    </VStack>
                  )}
                </VStack>
                </>
              )}
            </TabPanel>

            {/* ─ 예약 내역 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={4}>
                {isBookingsLoading
                  ? <Skeleton height='20px' width='120px' />
                  : `예약 내역 (${bookings?.count ?? 0})`}
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
              ) : !bookings || (bookings.count ?? 0) === 0 ? (
                <VStack minH='20vh' justify='center' spacing={2}>
                  <FaCalendarAlt size={36} color='#CBD5E0' />
                  <Text color='gray.400' mt={2}>
                    예약 내역이 없습니다.
                  </Text>
                </VStack>
              ) : (
                (() => {
                  const reviewedRoomPks = new Set(
                    reviews?.results?.filter((r) => r.room_pk).map((r) => r.room_pk!) ?? [],
                  );
                  const reviewedExpPks = new Set(
                    reviews?.results?.filter((r) => r.experience_pk).map((r) => r.experience_pk!) ?? [],
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
                      ? room?.thumbnail_url ?? undefined
                      : experience?.thumbnail_url ?? undefined;
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
                                  colorScheme='blue'
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
                                  colorScheme='blue'
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
                              {status.label === "완료" && !isRoom && (
                                <Button
                                  size='sm'
                                  colorScheme='purple'
                                  isDisabled={reviewedExpPks.has(experience?.pk!)}
                                  onClick={() => {
                                    setReviewBooking(booking);
                                    onReviewOpen();
                                  }}
                                >
                                  {reviewedExpPks.has(experience?.pk!)
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

                  const roomBookings = (bookings?.results ?? []).filter(
                    (b) => b.kind === "room",
                  );
                  const expBookings = (bookings?.results ?? []).filter((b) => b.kind !== "room");
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
                    <Tabs colorScheme='blue' variant='soft-rounded' size='sm'>
                      <TabList mb={4}>
                        <Tab>전체 ({bookings?.count ?? 0})</Tab>
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
                              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
                                {[...activeRooms, ...activeExps].map(
                                  renderBookingCard,
                                )}
                              </Grid>
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
                              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
                                {[...doneRooms, ...doneExps].map(
                                  renderBookingCard,
                                )}
                              </Grid>
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
                              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
                                {activeRooms.map(renderBookingCard)}
                              </Grid>
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
                              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
                                {doneRooms.map(renderBookingCard)}
                              </Grid>
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
                              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
                                {activeExps.map(renderBookingCard)}
                              </Grid>
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
                                  완료 — 리뷰를 남겨보세요
                                </Text>
                              </HStack>
                              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={3}>
                                {doneExps.map(renderBookingCard)}
                              </Grid>
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
              <Pagination
                currentPage={bookingPage}
                totalCount={bookings?.count ?? 0}
                pageSize={10}
                onPageChange={setBookingPage}
              />
            </TabPanel>

            {/* ─ 작성한 후기 탭 ─ */}
            <TabPanel p={0}>
              <Heading size='md' mb={4}>
                {isReviewsLoading ? (
                  <Skeleton height='20px' width='120px' />
                ) : (
                  `작성한 후기 (${reviews?.count ?? 0})`
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
              ) : reviews?.results && reviews.results.length > 0 ? (
                <>
                  <Tabs
                    variant='soft-rounded'
                    colorScheme='blue'
                    size='sm'
                    mb={4}
                    index={myReviewTab}
                    onChange={setMyReviewTab}
                  >
                    <TabList>
                      <Tab>전체 ({reviews?.count ?? 0})</Tab>
                      <Tab>숙소 ({roomReviews.length})</Tab>
                      <Tab>체험 ({experienceReviews.length})</Tab>
                    </TabList>
                  </Tabs>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                  {(myReviewTab === 0
                    ? (reviews?.results ?? [])
                    : myReviewTab === 1
                      ? roomReviews
                      : experienceReviews
                  ).map((review, i) => {
                    const target = getReviewTargetInfo(review);
                    const linkTo = target?.linkTo ?? null;
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
                                  star <= review.rating ? "#4299E1" : "#E2E8F0"
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
                                <Text fontSize='xs' color='blue.400' _hover={{ textDecoration: "underline" }}>
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
                              colorScheme='blue'
                              onClick={() => {
                                setDeletingReviewPk(review.pk);
                                onDeleteReviewOpen();
                              }}
                            >
                              삭제
                            </Button>
                          </HStack>
                        </HStack>
                        {target && (
                          <Flex
                            mt={3}
                            p={3}
                            gap={3}
                            borderWidth={1}
                            rounded='lg'
                            align='center'
                            bg='gray.50'
                            _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                          >
                            {target.imageUrl ? (
                              <Image
                                src={target.imageUrl}
                                alt={target.name}
                                boxSize='64px'
                                objectFit='cover'
                                rounded='md'
                                flexShrink={0}
                              />
                            ) : (
                              <Box
                                boxSize='64px'
                                rounded='md'
                                bg='gray.200'
                                _dark={{ bg: "gray.600" }}
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                flexShrink={0}
                              >
                                <Text fontSize='xs' color='gray.500'>
                                  {target.kind === "room" ? "숙소" : "체험"}
                                </Text>
                              </Box>
                            )}
                            <VStack align='start' spacing={1} minW={0}>
                              <Link to={target.linkTo}>
                                <Text fontWeight='semibold' noOfLines={1} _hover={{ textDecoration: "underline" }}>
                                  {target.name}
                                </Text>
                              </Link>
                              <HStack spacing={2} fontSize='xs' color='gray.500' flexWrap='wrap'>
                                {target.city && target.country && (
                                  <Text>{target.city}, {target.country}</Text>
                                )}
                                {typeof target.price === "number" && (
                                  <Text>₩{target.price.toLocaleString()}</Text>
                                )}
                                {target.kind === "experience" && target.schedule && (
                                  <Text>{target.schedule}</Text>
                                )}
                              </HStack>
                            </VStack>
                          </Flex>
                        )}
                        <Text color='gray.700'>{review.payload}</Text>
                      </Box>
                    );
                  })}
                </Grid>
                </>
              ) : (
                <VStack minH='20vh' justify='center'>
                  <Text color='gray.400'>작성한 후기가 없습니다.</Text>
                </VStack>
              )}
              <Pagination
                currentPage={reviewsPage}
                totalCount={reviews?.count ?? 0}
                pageSize={10}
                onPageChange={setReviewsPage}
              />
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
                    <FormLabel>자기소개</FormLabel>
                    <Textarea
                      {...profileRegister("bio")}
                      defaultValue={user?.bio || user?.name}
                      placeholder='자기소개를 입력해주세요'
                      rows={3}
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
                    <FormLabel>프로필 사진</FormLabel>
                    <input
                      type="file"
                      accept="image/*"
                      ref={avatarInputRef}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) avatarMutation.mutate(file);
                        e.target.value = "";
                      }}
                    />
                    <Box
                      position="relative"
                      display="inline-block"
                      cursor="pointer"
                      onClick={() => avatarInputRef.current?.click()}
                      title="클릭하여 사진 변경"
                    >
                      <Avatar
                        name={user?.name}
                        src={user?.avatar}
                        size="xl"
                        opacity={avatarMutation.isPending ? 0.5 : 1}
                      />
                      <Box
                        position="absolute"
                        bottom={0}
                        right={0}
                        bg="blue.500"
                        borderRadius="full"
                        p={1}
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FaCamera size={12} />
                      </Box>
                    </Box>
                  </FormControl>
                  <Button
                    type='submit'
                    isLoading={profileMutation.isPending}
                    colorScheme='blue'
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
                    colorScheme='blue'
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
                `등록한 숙소 (${rooms?.count ?? 0})`
              )}
            </Heading>
            {isRoomsLoading ? (
              <Grid
                templateColumns={PROFILE_GRID_COLUMNS}
                gap={6}
              >
                {[0, 1, 2].map((i) => (
                  <Box key={i}>
                    <Skeleton height='200px' rounded='xl' mb={3} />
                    <SkeletonText noOfLines={2} />
                  </Box>
                ))}
              </Grid>
            ) : rooms?.results && rooms.results.length > 0 ? (
              <Grid
                columnGap={4}
                rowGap={8}
                templateColumns={PROFILE_GRID_COLUMNS}
              >
                {(rooms?.results ?? []).map((room) => (
                  <Room
                    key={room.pk}
                    pk={room.pk}
                    isOwner={false}
                    imageUrl={room.thumbnail_url ?? ""}
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
            <Pagination
              currentPage={roomsPage}
              totalCount={rooms?.count ?? 0}
              pageSize={12}
              onPageChange={setRoomsPage}
            />
          </Box>

          <Divider />

          <Box>
            <Heading size='md' mb={4}>
              {isExperiencesLoading ? (
                <Skeleton height='20px' width='120px' />
              ) : (
                `등록한 체험 (${experiences?.count ?? 0})`
              )}
            </Heading>
            {isExperiencesLoading ? (
              <Grid
                templateColumns={PROFILE_GRID_COLUMNS}
                gap={6}
              >
                {[0, 1, 2].map((i) => (
                  <Box key={i}>
                    <Skeleton height='120px' rounded='xl' mb={3} />
                    <SkeletonText noOfLines={2} />
                  </Box>
                ))}
              </Grid>
            ) : experiences?.results && experiences.results.length > 0 ? (
              <Grid
                columnGap={4}
                rowGap={8}
                templateColumns={PROFILE_GRID_COLUMNS}
              >
                {(experiences?.results ?? []).map((exp) => (
                  <Experience
                    key={exp.pk}
                    pk={exp.pk}
                    name={exp.name}
                    city={exp.city}
                    country={exp.country}
                    price={exp.price}
                    start={exp.start}
                    end={exp.end}
                    imageUrl={exp.thumbnail_url ?? undefined}
                    rating={exp.rating}
                    isOwner={false}
                  />
                ))}
              </Grid>
            ) : (
              <Text color='gray.400'>등록한 체험이 없습니다.</Text>
            )}
            <Pagination
              currentPage={experiencesPage}
              totalCount={experiences?.count ?? 0}
              pageSize={12}
              onPageChange={setExperiencesPage}
            />
          </Box>

          <Divider />

          <Box>
            <Heading size='md' mb={4}>
              {isReviewsLoading ? (
                <Skeleton height='20px' width='120px' />
              ) : (
                `작성한 후기 (${reviews?.count ?? 0})`
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
            ) : reviews?.results && reviews.results.length > 0 ? (
              <>
                <Tabs
                  variant='soft-rounded'
                  colorScheme='blue'
                  size='sm'
                  mb={4}
                  index={publicReviewTab}
                  onChange={setPublicReviewTab}
                >
                  <TabList>
                    <Tab>전체 ({reviews?.count ?? 0})</Tab>
                    <Tab>숙소 ({roomReviews.length})</Tab>
                    <Tab>체험 ({experienceReviews.length})</Tab>
                  </TabList>
                </Tabs>
              <VStack spacing={4} align='stretch'>
                {(publicReviewTab === 0
                  ? (reviews?.results ?? [])
                  : publicReviewTab === 1
                    ? roomReviews
                    : experienceReviews
                ).map((review, i) => {
                  const target = getReviewTargetInfo(review);
                  const linkTo = target?.linkTo ?? null;
                  return (
                    <Box key={i} p={4} borderWidth={1} rounded='xl' _hover={{ shadow: "md", borderColor: "gray.300" }} transition='all 0.2s'>
                      <HStack justify='space-between' mb={2}>
                        <HStack spacing={1}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={14}
                              color={star <= review.rating ? "#4299E1" : "#E2E8F0"}
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
                              <Text fontSize='xs' color='blue.400' _hover={{ textDecoration: "underline" }}>
                                {review.room_pk ? "숙소 보기" : "체험 보기"} →
                              </Text>
                            </Link>
                          )}
                        </HStack>
                      </HStack>
                      {target && (
                        <Flex
                          mt={3}
                          p={3}
                          gap={3}
                          borderWidth={1}
                          rounded='lg'
                          align='center'
                          bg='gray.50'
                          _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                        >
                          {target.imageUrl ? (
                            <Image
                              src={target.imageUrl}
                              alt={target.name}
                              boxSize='64px'
                              objectFit='cover'
                              rounded='md'
                              flexShrink={0}
                            />
                          ) : (
                            <Box
                              boxSize='64px'
                              rounded='md'
                              bg='gray.200'
                              _dark={{ bg: "gray.600" }}
                              display='flex'
                              alignItems='center'
                              justifyContent='center'
                              flexShrink={0}
                            >
                              <Text fontSize='xs' color='gray.500'>
                                {target.kind === "room" ? "숙소" : "체험"}
                              </Text>
                            </Box>
                          )}
                          <VStack align='start' spacing={1} minW={0}>
                            <Link to={target.linkTo}>
                              <Text fontWeight='semibold' noOfLines={1} _hover={{ textDecoration: "underline" }}>
                                {target.name}
                              </Text>
                            </Link>
                            <HStack spacing={2} fontSize='xs' color='gray.500' flexWrap='wrap'>
                              {target.city && target.country && (
                                <Text>{target.city}, {target.country}</Text>
                              )}
                              {typeof target.price === "number" && (
                                <Text>₩{target.price.toLocaleString()}</Text>
                              )}
                              {target.kind === "experience" && target.schedule && (
                                <Text>{target.schedule}</Text>
                              )}
                            </HStack>
                          </VStack>
                        </Flex>
                      )}
                      <Text color='gray.700'>{review.payload}</Text>
                    </Box>
                  );
                })}
              </VStack>
              </>
            ) : (
              <Text color='gray.400'>작성한 후기가 없습니다.</Text>
            )}
            <Pagination
              currentPage={reviewsPage}
              totalCount={reviews?.count ?? 0}
              pageSize={10}
              onPageChange={setReviewsPage}
            />
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
                colorScheme='blue'
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
            <Button type='submit' colorScheme='blue' isLoading={editReviewMutation.isPending}>
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
                colorScheme='blue'
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
          <ModalHeader>
            리뷰 작성 — {reviewBooking?.room?.name ?? reviewBooking?.experience?.name}
          </ModalHeader>
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
              colorScheme='blue'
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
