import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getExperience } from "../api";
import { IExperienceDetail } from "../types";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  GridItem,
  HStack,
  Heading,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaClock, FaCheckCircle } from "react-icons/fa";
import { Helmet } from "react-helmet";

export default function ExperienceDetail() {
  const { experiencePk } = useParams();
  const { isLoading, data, isError } = useQuery<IExperienceDetail>({
    queryKey: ["experiences", experiencePk],
    queryFn: getExperience,
  });

  if (isError) {
    return (
      <VStack justifyContent="center" minH="50vh">
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
        <Skeleton height="36px" maxW="60%" />
      ) : (
        <Heading fontSize={{ base: "xl", md: "2xl" }}>{data?.name}</Heading>
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
              <SkeletonText noOfLines={3} />
            ) : (
              <VStack align="start" spacing={3}>
                <Text fontSize="2xl" fontWeight="bold">
                  ₩{data?.price.toLocaleString()}
                  <Text as="span" fontSize="md" fontWeight="normal" color="gray.500"> / 1인</Text>
                </Text>
                <Divider />
                <HStack spacing={1} fontSize="sm" color="gray.600">
                  <FaClock size={12} />
                  <Text>{data?.start} ~ {data?.end}</Text>
                </HStack>
                <HStack spacing={1} fontSize="sm" color="gray.600">
                  <FaMapMarkerAlt size={12} />
                  <Text>{data?.city}, {data?.country}</Text>
                </HStack>
              </VStack>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}
