import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPublicUser, getUserRooms, getUserReviews } from "../api";
import { IPublicUser, IRoomList, IReview } from "../types";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  HStack,
  Heading,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { Helmet } from "react-helmet";
import Room from "../components/Room";

export default function UserProfile() {
  const { username } = useParams();

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

  return (
    <Box mt={10} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{user ? `${user.name} — Airbnb clone` : "프로필"}</title>
      </Helmet>

      {/* 프로필 헤더 */}
      <HStack spacing={6} mb={8} align="start">
        {isUserLoading ? (
          <>
            <SkeletonCircle size="24" />
            <VStack align="start" spacing={2}>
              <Skeleton height="30px" width="200px" />
              <Skeleton height="18px" width="150px" />
            </VStack>
          </>
        ) : (
          <>
            <Avatar name={user?.name} src={user?.avatar} size="xl" />
            <VStack align="start" spacing={1}>
              <Heading fontSize="2xl">{user?.name}</Heading>
              <Text color="gray.500">@{user?.username}</Text>
              <Text fontSize="sm" color="gray.400">
                가입일: {user?.date_joined ? new Date(user.date_joined).toLocaleDateString("ko-KR") : ""}
              </Text>
            </VStack>
          </>
        )}
      </HStack>

      <Divider mb={8} />

      {/* 숙소 섹션 */}
      <Box mb={12}>
        <Heading size="md" mb={4}>
          {isRoomsLoading ? <Skeleton height="24px" width="120px" /> : `등록한 숙소 (${rooms?.length ?? 0})`}
        </Heading>
        {isRoomsLoading ? (
          <Grid
            templateColumns={{ sm: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
            gap={6}
          >
            {[0, 1, 2].map((i) => (
              <Box key={i}>
                <Skeleton height="200px" rounded="xl" mb={3} />
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
              <Room
                key={room.pk}
                pk={room.pk}
                isOwner={room.is_owner}
                imageUrl={room.photos[0]?.file ?? `https://source.unsplash.com/random/450x450`}
                name={room.name}
                rating={room.rating}
                city={room.city}
                country={room.country}
                price={room.price}
              />
            ))}
          </Grid>
        ) : (
          <Text color="gray.400">등록한 숙소가 없습니다.</Text>
        )}
      </Box>

      <Divider mb={8} />

      {/* 리뷰 섹션 */}
      <Box>
        <Heading size="md" mb={4}>
          {isReviewsLoading ? (
            <Skeleton height="24px" width="120px" />
          ) : (
            `작성한 후기 (${reviews?.length ?? 0})`
          )}
        </Heading>
        {isReviewsLoading ? (
          <VStack spacing={4} align="stretch">
            {[0, 1, 2].map((i) => (
              <Box key={i} p={4} borderWidth={1} rounded="xl">
                <SkeletonText noOfLines={3} />
              </Box>
            ))}
          </VStack>
        ) : reviews && reviews.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {reviews.map((review, i) => (
              <Box key={i} p={4} borderWidth={1} rounded="xl">
                <HStack mb={2} spacing={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={14}
                      color={star <= review.rating ? "#FF385C" : "#E2E8F0"}
                    />
                  ))}
                  <Text fontSize="sm" ml={1} color="gray.500">
                    {review.rating}점
                  </Text>
                </HStack>
                <Text color="gray.700">{review.payload}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.400">작성한 후기가 없습니다.</Text>
        )}
      </Box>
    </Box>
  );
}
