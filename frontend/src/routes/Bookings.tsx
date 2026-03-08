import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Heading,
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
  Skeleton,
  SkeletonText,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { cancelBooking, createReview, getBookings, IPaginatedResponse } from "../api";
import { getErrorDetail } from "../lib/getErrorDetail";
import type { ICreateReviewVariables } from "../api";
import { IBooking } from "../types";
import ProtectedPage from "../components/ProtectedPage";
import { FaCalendarAlt } from "react-icons/fa";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getNights(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getStatus(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return { label: "예약 확정", color: "green" };
  const now = new Date();
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (now < inDate) return { label: "예약 확정", color: "green" };
  if (now <= outDate) return { label: "진행 중", color: "blue" };
  return { label: "완료", color: "gray" };
}

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<IPaginatedResponse<IBooking>>({
    queryKey: ["bookings"],
    queryFn: () => getBookings(),
  });
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (pk: number) => cancelBooking(pk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({ title: "예약이 취소되었습니다.", status: "success", position: "bottom-right", duration: 3000 });
      onCancelClose();
    },
    onError: (error: any) => {
      toast({ title: "취소에 실패했습니다.", description: getErrorDetail(error), status: "error", position: "bottom-right", duration: 5000, isClosable: true });
      onCancelClose();
    },
  });

  const openCancelDialog = (pk: number) => {
    setCancelTarget(pk);
    onCancelOpen();
  };

  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const [reviewBooking, setReviewBooking] = useState<IBooking | null>(null);
  const { register, handleSubmit, reset } = useForm<ICreateReviewVariables>();

  const reviewMutation = useMutation({
    mutationFn: (variables: ICreateReviewVariables) =>
      createReview(String(reviewBooking?.room?.pk), variables),
    onSuccess: () => {
      toast({ title: "리뷰가 등록되었습니다.", status: "success", position: "bottom-right" });
      reset();
      onReviewClose();
    },
    onError: (error: any) => {
      toast({ title: "리뷰 등록에 실패했습니다.", description: getErrorDetail(error), status: "error", position: "bottom-right", duration: 5000, isClosable: true });
    },
  });

  const openReviewModal = (booking: IBooking) => {
    setReviewBooking(booking);
    onReviewOpen();
  };

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 20 }}>
        <Helmet>
          <title>예약 내역 — StayAI</title>
        </Helmet>
        <Heading mb={6}>예약 내역</Heading>

        {isLoading ? (
          <VStack spacing={4} align="stretch">
            {[0, 1, 2].map((i) => (
              <Box key={i} borderWidth={1} rounded="xl" overflow="hidden" p={4}>
                <HStack spacing={4}>
                  <Skeleton w="120px" h="90px" rounded="lg" />
                  <VStack align="start" flex={1} spacing={2}>
                    <Skeleton h="20px" w="60%" />
                    <SkeletonText noOfLines={2} w="80%" />
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        ) : (bookings?.count ?? 0) === 0 ? (
          <VStack justifyContent="center" minH="40vh" spacing={2}>
            <FaCalendarAlt size={48} color="gray" />
            <Text fontSize="lg" color="gray.500" mt={4}>
              예약 내역이 없습니다.
            </Text>
            <Text color="gray.400">숙소를 예약해보세요!</Text>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            {(bookings?.results ?? []).map((booking) => {
              const isRoom = booking.kind === "room";
              const nights = booking.check_in && booking.check_out
                ? getNights(booking.check_in, booking.check_out)
                : 0;
              const status = getStatus(booking.check_in, booking.check_out);
              const room = booking.room;
              const experience = booking.experience;
              const name = isRoom ? room?.name : experience?.name;
              const city = isRoom ? room?.city : experience?.city;
              const country = isRoom ? room?.country : experience?.country;
              const photo = isRoom
                ? room?.thumbnail_url ?? undefined
                : experience?.thumbnail_url ?? undefined;
              const linkTo = isRoom ? `/rooms/${room?.pk}` : `/experiences/${experience?.pk}`;
              return (
                <Box
                  key={booking.pk}
                  borderWidth={1}
                  rounded="xl"
                  overflow="hidden"
                  p={4}
                  _hover={{ shadow: "md", borderColor: "gray.400" }}
                  transition="all 0.2s"
                >
                  <HStack spacing={4} align="start">
                    <Link to={linkTo}>
                      <Image
                        src={photo ?? ""}
                        w="120px"
                        h="90px"
                        objectFit="cover"
                        rounded="lg"
                        flexShrink={0}
                        bg="gray.200"
                        fallback={<Box w="120px" h="90px" bg="gray.200" rounded="lg" />}
                      />
                    </Link>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack justify="space-between" w="100%">
                        <HStack spacing={2}>
                          <Link to={linkTo}>
                            <Text fontWeight="bold" fontSize="md" noOfLines={1} _hover={{ textDecoration: "underline" }}>
                              {name}
                            </Text>
                          </Link>
                          <Badge colorScheme={isRoom ? "blue" : "purple"} px={2} py={0.5} rounded="md" fontSize="xs">
                            {isRoom ? "숙소" : "체험"}
                          </Badge>
                        </HStack>
                        <Badge colorScheme={status.color} px={2} py={1} rounded="md">
                          {status.label}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {city}, {country}
                      </Text>
                      <Divider my={1} />
                      <HStack spacing={4} fontSize="sm" flexWrap="wrap">
                        <Text>
                          <Text as="span" fontWeight="semibold">{isRoom ? "체크인" : "시작"}</Text>{" "}
                          {booking.check_in ? formatDate(booking.check_in) : "-"}
                          {booking.check_in_time && (
                            <Text as="span" color="gray.500"> {booking.check_in_time.slice(0, 5)}</Text>
                          )}
                        </Text>
                        <Text color="gray.400">→</Text>
                        <Text>
                          <Text as="span" fontWeight="semibold">{isRoom ? "체크아웃" : "종료"}</Text>{" "}
                          {booking.check_out ? formatDate(booking.check_out) : "-"}
                          {booking.check_out_time && (
                            <Text as="span" color="gray.500"> {booking.check_out_time.slice(0, 5)}</Text>
                          )}
                        </Text>
                      </HStack>
                      <HStack spacing={4} fontSize="sm" color="gray.600">
                        {isRoom && <Text>{nights}박</Text>}
                        {isRoom && <Text>·</Text>}
                        <Text>게스트 {booking.guests}명</Text>
                        {isRoom && room && (
                          <>
                            <Text>·</Text>
                            <Text fontWeight="semibold">
                              ₩{(room.price * nights).toLocaleString()}
                            </Text>
                          </>
                        )}
                        {!isRoom && experience && (
                          <>
                            <Text>·</Text>
                            <Text fontWeight="semibold">
                              ₩{(experience.price * booking.guests).toLocaleString()}
                            </Text>
                          </>
                        )}
                      </HStack>
                      <HStack mt={2} spacing={2}>
                        {status.label === "예약 확정" && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => openCancelDialog(booking.pk)}
                          >
                            예약 취소
                          </Button>
                        )}
                        {status.label === "완료" && isRoom && (
                          <Button
                            size="sm"
                            colorScheme="gray"
                            variant="outline"
                            onClick={() => openReviewModal(booking)}
                          >
                            리뷰 작성
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      <AlertDialog isOpen={isCancelOpen} leastDestructiveRef={cancelRef} onClose={onCancelClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
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
                colorScheme="blue"
                ml={3}
                isLoading={cancelMutation.isPending}
                onClick={() => {
                  if (cancelTarget !== null) cancelMutation.mutate(cancelTarget);
                }}
              >
                취소하기
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit((data) => reviewMutation.mutate(data))}>
          <ModalHeader>리뷰 작성 — {reviewBooking?.room?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>별점</FormLabel>
                <NumberInput min={1} max={5} defaultValue={5}>
                  <NumberInputField
                    {...register("rating", { required: true, valueAsNumber: true, min: 1, max: 5 })}
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
                  {...register("payload", { required: true })}
                  placeholder="숙소에 대한 솔직한 후기를 남겨주세요"
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
    </ProtectedPage>
  );
}
