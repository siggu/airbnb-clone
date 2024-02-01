import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRoom, getRoomReviews } from "../api";
import { IReview, IRoomDetail } from "../types";
import {
  Avatar,
  Box,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Image,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";

export default function RoomDetail() {
  const { roomPk } = useParams();
  const { isLoading, data } = useQuery<IRoomDetail>({
    queryKey: [`rooms`, roomPk],
    queryFn: getRoom,
  });
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<
    IReview[]
  >({
    queryKey: [`rooms`, roomPk, `reviews`],
    queryFn: getRoomReviews,
  });
  return (
    <Box
      mt={"10"}
      px={{
        sm: 10,
        lg: 20,
      }}
    >
      <Skeleton height={"43px"} width={"25%"} isLoaded={!isLoading}>
        <Heading>{data?.name}</Heading>
      </Skeleton>
      <Grid
        mt={7}
        rounded={"xl"}
        overflow={"hidden"}
        gap={2}
        height="60vh"
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
              <Image
                objectFit={"cover"}
                w={"100%"}
                h={"100%"}
                src={data?.photos[index].file}
              />
            </Skeleton>
          </GridItem>
        ))}
      </Grid>
      <HStack w={"50%"} justifyContent={"space-between"} mt={10}>
        <VStack alignItems={"flex-start"}>
          <Skeleton isLoaded={!isLoading} height={"30px"}>
            <Heading fontSize={"2xl"}>
              House hosted by {data?.owner.username}
            </Heading>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} height={"30px"}>
            <HStack justifyContent={"flex-start"} w={"100%"}>
              <Text>
                {data?.toilets} toilet{data?.toilets === 1 ? "" : "s"}
              </Text>
              <Text>•</Text>
              <Text>
                {data?.rooms} room{data?.rooms === 1 ? "" : "s"}
              </Text>
            </HStack>
          </Skeleton>
        </VStack>
        <Avatar
          name={data?.owner.username}
          size={"xl"}
          src={data?.owner.avatar}
        />
      </HStack>
      <Box mt={10}>
        <Heading mb={5} fontSize={"2xl"}>
          <Skeleton w={"15%"} isLoaded={!isLoading} height={"30px"}>
            <HStack>
              <FaStar /> <Text> {data?.rating}</Text>
              <Text>•</Text>
              <Text>
                {reviewsData?.length} review
                {reviewsData?.length === 1 ? "" : "s"}
              </Text>
            </HStack>
          </Skeleton>
        </Heading>
        <Container marginX={"none"} maxW={"container.xl"} mt={10}>
          <Grid templateColumns={"repeat(2, 1fr)"} gap={10}>
            {isReviewsLoading
              ? [1, 2, 3, 4].map((index) => (
                  <Box>
                    <VStack alignItems={"flex-start"}>
                      <HStack>
                        <Avatar size={"md"}></Avatar>
                        <VStack alignItems={"flex-start"} spacing={1}>
                          <Skeleton w={"200px"} h="25px">
                            <Heading fontSize={"md"}>Loading...</Heading>
                          </Skeleton>

                          <Skeleton w={"50px"} h="10px">
                            <HStack spacing={1}>
                              <FaStar size={"12px"}></FaStar>
                              <Text>Loading...</Text>
                            </HStack>
                          </Skeleton>
                        </VStack>
                      </HStack>
                      <Skeleton w={"500px"} h={"150px"}>
                        <Text>Loading...</Text>
                      </Skeleton>
                    </VStack>
                  </Box>
                ))
              : reviewsData?.map((review, index) => (
                  <Box>
                    <VStack spacing={3} alignItems={"flex-start"}>
                      <HStack spacing={4}>
                        <Avatar
                          name={review.user.username}
                          src={review.user.avatar}
                          size={"md"}
                        ></Avatar>
                        <VStack alignItems={"flex-start"} spacing={0}>
                          <Heading fontSize={"md"}>
                            {review.user.username}
                          </Heading>
                          <HStack spacing={1}>
                            <FaStar size={"12px"}></FaStar>
                            <Text>{review.rating}</Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Text>{review.payload}</Text>
                    </VStack>
                  </Box>
                ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
