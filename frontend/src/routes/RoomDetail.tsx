import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { checkBooking, getRoom, getRoomReviews } from "../api";
import { IReview, IRoomDetail } from "../types";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
  Wrap,
  WrapItem,
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
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";

const KIND_LABELS: Record<string, string> = {
  entire_place: "Entire place",
  private_room: "Private room",
  shared_room: "Shared room",
};

export default function RoomDetail() {
  const { roomPk } = useParams();
  const { isLoading, data, isError } = useQuery<IRoomDetail>({
    queryKey: [`rooms`, roomPk],
    queryFn: getRoom,
  });
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<IReview[]>({
    queryKey: [`rooms`, roomPk, `reviews`],
    queryFn: getRoomReviews,
  });
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
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseLeave = () => { isDragging.current = false; };

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = data?.photos ?? [];
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextPhoto = () => setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      else if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));
      else if (e.key === "Escape")
        setLightboxIndex(null);
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

  if (isError) {
    return (
      <VStack justifyContent={"center"} minH={"50vh"}>
        <Helmet>
          <title>Not Found — Airbnb clone</title>
        </Helmet>
        <Heading>Room not found.</Heading>
        <Text>This room may have been removed or does not exist.</Text>
      </VStack>
    );
  }

  return (
    <Box mt={"10"} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{data ? data.name : "loading..."}</title>
      </Helmet>

      {/* 제목 */}
      {isLoading ? (
        <Skeleton height={"36px"} maxW={"60%"} />
      ) : (
        <Heading fontSize={{ base: "xl", md: "2xl" }}>{data?.name}</Heading>
      )}

      {/* 부제목: 평점 · 리뷰 수 · 위치 */}
      <Box mt={2}>
        {isLoading ? (
          <Skeleton height={"18px"} maxW={"45%"} />
        ) : (
          <Wrap spacing={1} fontSize={"sm"} color={"gray.600"} align={"center"}>
            <WrapItem alignItems={"center"}>
              <HStack spacing={1}>
                <FaStar size={12} color="#FF385C" />
                <Text fontWeight={"semibold"} color={"black"}>{data?.rating}</Text>
              </HStack>
            </WrapItem>
            <WrapItem alignItems={"center"}><Text>·</Text></WrapItem>
            <WrapItem alignItems={"center"}>
              <Text textDecoration={"underline"} cursor={"pointer"}>
                {reviewsData?.length} review{reviewsData?.length === 1 ? "" : "s"}
              </Text>
            </WrapItem>
            <WrapItem alignItems={"center"}><Text>·</Text></WrapItem>
            <WrapItem alignItems={"center"}>
              <HStack spacing={1}>
                <FaMapMarkerAlt size={11} />
                <Text>{data?.city}, {data?.country}</Text>
              </HStack>
            </WrapItem>
          </Wrap>
        )}
      </Box>

      {/* 사진 영역 */}

      {/* 모바일: 가로 스크롤로 모든 사진 표시 */}
      <Box
        ref={scrollRef}
        display={{ base: "flex", md: "none" }}
        mt={5}
        gap={2}
        overflowX={"auto"}
        h={"220px"}
        cursor={isDragging.current ? "grabbing" : "grab"}
        userSelect={"none"}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        sx={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
      >
        {isLoading
          ? [0, 1, 2].map((i) => (
              <Box key={i} flexShrink={0} h={"100%"} w={"280px"} rounded={"xl"} overflow={"hidden"}>
                <Skeleton h={"100%"} w={"100%"} />
              </Box>
            ))
          : data?.photos && data.photos.length > 0
          ? data.photos.map((photo, i) => (
              <Box
                key={i}
                flexShrink={0}
                h={"100%"}
                w={"280px"}
                rounded={"xl"}
                overflow={"hidden"}
                cursor={"pointer"}
                onClick={() => openLightbox(i)}
              >
                <Image objectFit={"cover"} w={"100%"} h={"100%"} src={photo.file} />
              </Box>
            ))
          : (
              <Box flexShrink={0} h={"100%"} w={"100%"} rounded={"xl"} bg={"gray.200"} />
            )}
      </Box>

      {/* 태블릿: 2컬럼 그리드 */}
      <Grid
        display={{ base: "none", md: "grid", lg: "none" }}
        mt={5}
        rounded={"xl"}
        overflow={"hidden"}
        h={"50vh"}
        minH={"300px"}
        gap={2}
        templateColumns={"1fr 1fr"}
        templateRows={"1fr 1fr"}
      >
        {[0, 1, 2, 3].map((index) => (
          <GridItem rowSpan={index === 0 ? 2 : 1} overflow={"hidden"} key={index}>
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

      {/* 데스크탑: 5장 그리드 */}
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
          <Flex justifyContent={"space-between"} alignItems={"flex-start"} pb={6} gap={4}>
            <VStack alignItems={"flex-start"} spacing={2} flex={1} minW={0}>
              {isLoading ? (
                <Skeleton height={"28px"} w={"70%"} />
              ) : (
                <Heading fontSize={{ base: "lg", md: "xl" }}>
                  {data ? KIND_LABELS[data.kind] ?? data.kind : ""} hosted by {data?.owner.username}
                </Heading>
              )}
              {isLoading ? (
                <Skeleton height={"18px"} w={"50%"} />
              ) : (
                <Wrap spacing={1} fontSize={"sm"} color={"gray.500"} align={"center"}>
                  <WrapItem alignItems={"center"}>
                    <HStack spacing={1}>
                      <FaBed size={13} />
                      <Text>{data?.rooms} room{data?.rooms === 1 ? "" : "s"}</Text>
                    </HStack>
                  </WrapItem>
                  <WrapItem alignItems={"center"}><Text>·</Text></WrapItem>
                  <WrapItem alignItems={"center"}>
                    <HStack spacing={1}>
                      <FaBath size={13} />
                      <Text>{data?.toilets} toilet{data?.toilets === 1 ? "" : "s"}</Text>
                    </HStack>
                  </WrapItem>
                  {data?.pet_friendly && (
                    <>
                      <WrapItem alignItems={"center"}><Text>·</Text></WrapItem>
                      <WrapItem alignItems={"center"}>
                        <HStack spacing={1}>
                          <FaPaw size={12} />
                          <Text>Pet friendly</Text>
                        </HStack>
                      </WrapItem>
                    </>
                  )}
                </Wrap>
              )}
            </VStack>
            <SkeletonCircle size={"14"} isLoaded={!isLoading} flexShrink={0}>
              <Avatar name={data?.owner.username} size={"lg"} src={data?.owner.avatar} />
            </SkeletonCircle>
          </Flex>

          <Divider />

          {/* 카테고리 */}
          {(isLoading || data?.category) && (
            <>
              <Box py={5}>
                {isLoading ? (
                  <Skeleton height={"24px"} w={"30%"} />
                ) : (
                  <Wrap spacing={2} align={"center"}>
                    <WrapItem>
                      <Badge colorScheme="red" fontSize={"sm"} px={3} py={1} borderRadius={"full"}>
                        {data?.category?.name}
                      </Badge>
                    </WrapItem>
                    {data?.address && (
                      <WrapItem alignItems={"center"}>
                        <HStack spacing={1} color={"gray.500"} fontSize={"sm"} flexWrap={"wrap"}>
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
                <Skeleton height={"24px"} w={"40%"} mb={3} />
                <SkeletonText mt={2} noOfLines={4} spacing={3} />
              </>
            ) : (
              <>
                <Heading fontSize={"xl"} mb={3}>About this place</Heading>
                <Text color={"gray.700"} lineHeight={1.8} whiteSpace={"pre-line"}>
                  {data?.description || "No description provided."}
                </Text>
              </>
            )}
          </Box>

          <Divider />

          {/* 어메니티 */}
          <Box py={6}>
            {isLoading ? (
              <>
                <Skeleton height={"24px"} w={"50%"} mb={4} />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={"24px"} />)}
                </SimpleGrid>
              </>
            ) : (
              <>
                <Heading fontSize={"xl"} mb={4}>What this place offers</Heading>
                {data?.amenities && data.amenities.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {data.amenities.map((amenity) => (
                      <HStack key={amenity.pk} spacing={3} alignItems={"flex-start"}>
                        <Box mt={"2px"} flexShrink={0}>
                          <FaCheckCircle color="#00a699" size={15} />
                        </Box>
                        <VStack alignItems={"flex-start"} spacing={0} minW={0}>
                          <Text fontWeight={"medium"} fontSize={"sm"}>{amenity.name}</Text>
                          {amenity.description && (
                            <Text fontSize={"xs"} color={"gray.400"}>{amenity.description}</Text>
                          )}
                        </VStack>
                      </HStack>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text color={"gray.400"} fontSize={"sm"}>No amenities listed.</Text>
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
              <HStack spacing={2} mb={6}>
                <FaStar color="#FF385C" />
                <Heading fontSize={"xl"}>
                  {data?.rating} · {reviewsData?.length} review{reviewsData?.length === 1 ? "" : "s"}
                </Heading>
              </HStack>
            )}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
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
                          <Heading fontSize={"sm"} noOfLines={1}>{review.user.username}</Heading>
                          <HStack spacing={1}>
                            <FaStar size={11} color="#FF385C" />
                            <Text fontSize={"sm"} color={"gray.500"}>{review.rating}</Text>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Text fontSize={"sm"} color={"gray.700"} lineHeight={1.7}>
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
            rounded={"2xl"}
            shadow={"xl"}
            p={{ base: 4, md: 6 }}
          >
            {isLoading ? (
              <Skeleton height={"36px"} maxW={"140px"} mb={4} />
            ) : (
              <HStack alignItems={"baseline"} mb={1}>
                <Heading fontSize={"2xl"}>${data?.price?.toLocaleString()}</Heading>
                <Text color={"gray.500"} fontSize={"sm"}>/ night</Text>
              </HStack>
            )}
            {isLoading ? (
              <Skeleton height={"16px"} maxW={"120px"} mb={4} />
            ) : (
              <HStack spacing={1} mb={4} fontSize={"sm"} color={"gray.500"}>
                <FaStar size={11} color="#FF385C" />
                <Text fontWeight={"semibold"} color={"black"}>{data?.rating}</Text>
                <Text>·</Text>
                <Text>{reviewsData?.length} review{reviewsData?.length === 1 ? "" : "s"}</Text>
              </HStack>
            )}
            <Divider mb={4} />
            <Box overflowX={"auto"}>
              <Calendar
                onChange={(value: Value) => setDates(value as Date[])}
                prev2Label={null}
                next2Label={null}
                minDetail="month"
                minDate={new Date()}
                maxDate={new Date(Date.now() + 60 * 60 * 24 * 7 * 4 * 6 * 1000)}
                selectRange
              />
            </Box>
            <Button
              disabled={!checkBookingData?.ok}
              isLoading={isCheckingBooking && dates !== undefined}
              mt={5}
              w="100%"
              colorScheme="red"
              size={"lg"}
              rounded={"xl"}
            >
              Reserve
            </Button>
            {!isCheckingBooking && !checkBookingData?.ok ? (
              <Text color={"red.400"} textAlign={"center"} mt={3} fontSize={"sm"}>
                Can't book on those dates, sorry.
              </Text>
            ) : null}
            <Text textAlign={"center"} mt={3} fontSize={"xs"} color={"gray.400"}>
              You won't be charged yet
            </Text>
          </Box>
        </Box>
      </Grid>

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
              icon={<Text fontSize={"xl"} fontWeight={"bold"} color={"white"}>✕</Text>}
              position={"absolute"}
              top={4}
              right={4}
              variant={"ghost"}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
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
              icon={<Text fontSize={"2xl"} color={"white"}>‹</Text>}
              position={"absolute"}
              left={{ base: 2, md: 6 }}
              variant={"ghost"}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
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
              icon={<Text fontSize={"2xl"} color={"white"}>›</Text>}
              position={"absolute"}
              right={{ base: 2, md: 6 }}
              variant={"ghost"}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              isDisabled={lightboxIndex === photos.length - 1}
              zIndex={10}
              size={"lg"}
            />
          </Flex>
        </ModalContent>
      </Modal>
    </Box>
  );
}
