import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Badge,
  Divider,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { getBookings } from "../api";
import { IBooking } from "../types";
import ProtectedPage from "../components/ProtectedPage";
import { FaCalendarAlt } from "react-icons/fa";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getNights(checkIn: string, checkOut: string) {
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getStatus(checkIn: string, checkOut: string) {
  const now = new Date();
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (now < inDate) return { label: "예약 확정", color: "green" };
  if (now <= outDate) return { label: "숙박 중", color: "blue" };
  return { label: "완료", color: "gray" };
}

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<IBooking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 20 }}>
        <Helmet>
          <title>예약 내역 — Airbnb clone</title>
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
        ) : bookings?.length === 0 ? (
          <VStack justifyContent="center" minH="40vh" spacing={2}>
            <FaCalendarAlt size={48} color="gray" />
            <Text fontSize="lg" color="gray.500" mt={4}>
              예약 내역이 없습니다.
            </Text>
            <Text color="gray.400">숙소를 예약해보세요!</Text>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            {bookings?.map((booking) => {
              const nights = getNights(booking.check_in, booking.check_out);
              const status = getStatus(booking.check_in, booking.check_out);
              const room = booking.room;
              return (
                <Link to={`/rooms/${room?.pk}`} key={booking.pk}>
                  <Box
                    borderWidth={1}
                    rounded="xl"
                    overflow="hidden"
                    p={4}
                    _hover={{ shadow: "md", borderColor: "gray.400" }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={4} align="start">
                      <Image
                        src={
                          room?.photos?.[0]?.file ??
                          "https://source.unsplash.com/random/200x150"
                        }
                        w="120px"
                        h="90px"
                        objectFit="cover"
                        rounded="lg"
                        flexShrink={0}
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                            {room?.name}
                          </Text>
                          <Badge colorScheme={status.color} px={2} py={1} rounded="md">
                            {status.label}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {room?.city}, {room?.country}
                        </Text>
                        <Divider my={1} />
                        <HStack spacing={4} fontSize="sm">
                          <Text>
                            <Text as="span" fontWeight="semibold">체크인</Text>{" "}
                            {formatDate(booking.check_in)}
                          </Text>
                          <Text color="gray.400">→</Text>
                          <Text>
                            <Text as="span" fontWeight="semibold">체크아웃</Text>{" "}
                            {formatDate(booking.check_out)}
                          </Text>
                        </HStack>
                        <HStack spacing={4} fontSize="sm" color="gray.600">
                          <Text>{nights}박</Text>
                          <Text>·</Text>
                          <Text>게스트 {booking.guests}명</Text>
                          <Text>·</Text>
                          <Text fontWeight="semibold">
                            ₩{(room?.price * nights).toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                </Link>
              );
            })}
          </VStack>
        )}
      </Box>
    </ProtectedPage>
  );
}
