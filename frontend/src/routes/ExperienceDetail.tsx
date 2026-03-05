import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getExperience, getWishlists, createWishlist, toggleWishlistExperience, deleteExperience, createExperienceBooking, ICreateExperienceBookingVariables } from "../api";
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
  Input,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FaMapMarkerAlt, FaClock, FaCheckCircle, FaHeart, FaRegHeart, FaCamera } from "react-icons/fa";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import useUser from "../lib/useUser";
import { useRef } from "react";
import { getErrorDetail } from "../lib/getErrorDetail";

export default function ExperienceDetail() {
  const { experiencePk } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const { register, handleSubmit } = useForm<{ date: string; guests: number }>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
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
    wishlists?.flatMap((w) => (w.experiences ?? []).map((e) => e.pk)) ?? []
  );
  const isWishlisted = experiencePk ? wishlistedPks.has(Number(experiencePk)) : false;

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
        title: isWishlisted ? "위시리스트에서 제거되었습니다." : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });

  const onWishlistClick = () => {
    if (!isLoggedIn) {
      toast({ title: "로그인이 필요합니다.", status: "warning", position: "bottom-right", duration: 2000 });
      return;
    }
    wishlistToggle.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteExperience(experiencePk!),
    onSuccess: () => {
      toast({ title: "체험이 삭제되었습니다.", status: "success", position: "bottom-right" });
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
    mutationFn: (variables: { date: string; guests: number }) => {
      const experience_time = `${variables.date}T${data?.start ?? "00:00"}:00`;
      return createExperienceBooking(experiencePk!, { experience_time, guests: variables.guests });
    },
    onSuccess: () => {
      toast({ title: "예약이 완료되었습니다.", status: "success", position: "bottom-right" });
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

  if (isError) {
    return (
      <VStack justifyContent="center" minH="50vh">
        <Heading>체험을 찾을 수 없습니다.</Heading>
        <Text>삭제되었거나 존재하지 않는 체험입니다.</Text>
      </VStack>
    );
  }

  const photos = data?.photos ?? [];

  return (
    <Box mt={10} px={{ base: 4, sm: 8, lg: 20 }} pb={20}>
      <Helmet>
        <title>{data ? data.name : "로딩 중..."}</title>
      </Helmet>

      {/* 제목 */}
      {isLoading ? (
        <Skeleton height="36px" maxW="60%" />
      ) : (
        <Flex justify="space-between" align="center">
          <Heading fontSize={{ base: "xl", md: "2xl" }}>{data?.name}</Heading>
          <HStack spacing={2}>
            {data?.is_owner && (
              <>
                <Link to={`/experiences/${experiencePk}/photos`}>
                  <IconButton
                    aria-label="사진 업로드"
                    variant={"unstyled"}
                    icon={<FaCamera size={"20px"} />}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  />
                </Link>
                <Link to={`/experiences/${experiencePk}/edit`}>
                  <Button size="sm" variant="outline">수정</Button>
                </Link>
                <Button size="sm" colorScheme="red" variant="outline" onClick={onDeleteOpen}>삭제</Button>
              </>
            )}
          <IconButton
            aria-label="위시리스트"
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
          <Skeleton height="18px" maxW="45%" />
        ) : (
          <Wrap spacing={3} fontSize="sm" color="gray.600" align="center">
            <WrapItem alignItems="center">
              <HStack spacing={1}>
                <FaMapMarkerAlt size={12} />
                <Text>{data?.city}, {data?.country}</Text>
              </HStack>
            </WrapItem>
            <WrapItem alignItems="center"><Text>·</Text></WrapItem>
            <WrapItem alignItems="center">
              <HStack spacing={1}>
                <FaClock size={12} />
                <Text>{data?.start} ~ {data?.end}</Text>
              </HStack>
            </WrapItem>
            <WrapItem alignItems="center"><Text>·</Text></WrapItem>
            <WrapItem alignItems="center">
              <Text fontWeight="bold" color="black">₩{data?.price.toLocaleString()} / 1인</Text>
            </WrapItem>
          </Wrap>
        )}
      </Box>

      {/* 사진 갤러리 */}
      {(isLoading || photos.length > 0) && (
        <Box mt={5}>
          {isLoading ? (
            <Grid templateColumns="repeat(3, 1fr)" gap={2} h="240px">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} h="100%" rounded="xl" />
              ))}
            </Grid>
          ) : (
            <Box
              display="flex"
              gap={2}
              overflowX="auto"
              h={{ base: "200px", md: "300px" }}
              sx={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
            >
              {photos.map((photo, i) => (
                <Box
                  key={i}
                  flexShrink={0}
                  h="100%"
                  w={{ base: "260px", md: "400px" }}
                  rounded="xl"
                  overflow="hidden"
                >
                  <Image objectFit="cover" w="100%" h="100%" src={photo.file} alt={photo.description} />
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
                <Skeleton w="50px" h="50px" rounded="full" />
                <SkeletonText noOfLines={2} w="200px" />
              </>
            ) : (
              <>
                <Avatar name={data?.host.name} src={data?.host.avatar} size="md" />
                <Box>
                  <Text fontWeight="bold">{data?.host.name} 님이 진행하는 체험</Text>
                  <Text fontSize="sm" color="gray.500">@{data?.host.username}</Text>
                </Box>
              </>
            )}
          </HStack>

          <Divider mb={6} />

          {/* 설명 */}
          <Box mb={6}>
            <Heading size="md" mb={3}>체험 소개</Heading>
            {isLoading ? (
              <SkeletonText noOfLines={4} />
            ) : (
              <Text color="gray.700" lineHeight={1.8}>{data?.description}</Text>
            )}
          </Box>

          {/* 주소 */}
          {data?.address && (
            <>
              <Divider mb={6} />
              <Box mb={6}>
                <Heading size="md" mb={3}>위치</Heading>
                <HStack spacing={2} color="gray.600">
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
                <Heading size="md" mb={4}>포함 사항</Heading>
                {isLoading ? (
                  <SkeletonText noOfLines={3} />
                ) : (
                  <VStack align="start" spacing={3}>
                    {data?.perks.map((perk) => (
                      <HStack key={perk.pk} align="start" spacing={3}>
                        <Box mt={1} color="green.500">
                          <FaCheckCircle />
                        </Box>
                        <Box>
                          <Text fontWeight="semibold">{perk.name}</Text>
                          {perk.detail && (
                            <Text fontSize="sm" color="gray.500">{perk.detail}</Text>
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

        {/* 가격 카드 */}
        <GridItem>
          <Box
            position="sticky"
            top="100px"
            borderWidth={1}
            rounded="2xl"
            p={6}
            shadow="lg"
          >
            {isLoading ? (
              <SkeletonText noOfLines={5} />
            ) : (
              <VStack align="start" spacing={3} w="100%">
                <Text fontSize="2xl" fontWeight="bold">
                  ₩{data?.price.toLocaleString()}
                  <Text as="span" fontSize="md" fontWeight="normal" color="gray.500"> / 1인</Text>
                </Text>
                <HStack spacing={1} fontSize="sm" color="gray.600">
                  <FaClock size={12} />
                  <Text>{data?.start} ~ {data?.end}</Text>
                </HStack>
                <HStack spacing={1} fontSize="sm" color="gray.600">
                  <FaMapMarkerAlt size={12} />
                  <Text>{data?.city}, {data?.country}</Text>
                </HStack>
                {!data?.is_owner && (
                  <>
                    <Divider />
                    <VStack
                      as="form"
                      w="100%"
                      spacing={3}
                      onSubmit={handleSubmit((values) => bookingMutation.mutate(values))}
                    >
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">날짜</FormLabel>
                        <Input
                          type="date"
                          size="sm"
                          {...register("date", { required: true })}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">인원</FormLabel>
                        <Input
                          type="number"
                          size="sm"
                          min={1}
                          defaultValue={1}
                          {...register("guests", { required: true, valueAsNumber: true, min: 1 })}
                        />
                      </FormControl>
                      <Button
                        type="submit"
                        w="100%"
                        colorScheme="red"
                        isLoading={bookingMutation.isPending}
                        isDisabled={!isLoggedIn}
                      >
                        {isLoggedIn ? "예약하기" : "로그인 후 예약"}
                      </Button>
                    </VStack>
                  </>
                )}
              </VStack>
            )}
          </Box>
        </GridItem>
      </Grid>

      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>체험 삭제</AlertDialogHeader>
            <AlertDialogBody>정말로 이 체험을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>취소</Button>
              <Button
                colorScheme="red"
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
