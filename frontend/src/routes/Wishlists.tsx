import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  Divider,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { createWishlist, getWishlists, toggleWishlistRoom, toggleWishlistExperience } from "../api";
import { IWishlist } from "../types";
import Room from "../components/Room";
import Experience from "../components/Experience";
import ProtectedPage from "../components/ProtectedPage";
import { getErrorDetail } from "../lib/getErrorDetail";
import useUser from "../lib/useUser";

export default function Wishlists() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isLoggedIn } = useUser();

  const { data: wishlists, isLoading } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isLoggedIn,
  });

  const wishlistedRoomPks = new Set(
    wishlists?.flatMap((w) => w.rooms.map((r) => r.pk)) ?? []
  );
  const wishlistedExpPks = new Set(
    wishlists?.flatMap((w) => (w.experiences ?? []).map((e) => e.pk)) ?? []
  );

  const getWishlistPk = () => wishlists?.[0]?.pk;

  const roomToggleMutation = useMutation({
    mutationFn: async (roomPk: number) => {
      const wPk = getWishlistPk();
      if (!wPk) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistRoom(newWishlist.pk, roomPk);
      }
      return toggleWishlistRoom(wPk, roomPk);
    },
    onSuccess: (_, roomPk) => {
      const was = wishlistedRoomPks.has(roomPk);
      toast({
        title: was ? "위시리스트에서 제거되었습니다." : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (error: any) => {
      toast({ title: "오류가 발생했습니다.", description: getErrorDetail(error), status: "error", position: "bottom-right", duration: 5000, isClosable: true });
    },
  });

  const expToggleMutation = useMutation({
    mutationFn: async (expPk: number) => {
      const wPk = getWishlistPk();
      if (!wPk) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistExperience(newWishlist.pk, expPk);
      }
      return toggleWishlistExperience(wPk, expPk);
    },
    onSuccess: (_, expPk) => {
      const was = wishlistedExpPks.has(expPk);
      toast({
        title: was ? "위시리스트에서 제거되었습니다." : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
    onError: (error: any) => {
      toast({ title: "오류가 발생했습니다.", description: getErrorDetail(error), status: "error", position: "bottom-right", duration: 5000, isClosable: true });
    },
  });

  const allRooms = wishlists?.flatMap((w) => w.rooms) ?? [];
  const allExperiences = wishlists?.flatMap((w) => w.experiences ?? []) ?? [];
  const isEmpty = !isLoading && allRooms.length === 0 && allExperiences.length === 0;

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 20 }}>
        <Helmet>
          <title>위시리스트 — StayAI</title>
        </Helmet>
        <Heading mb={6}>위시리스트</Heading>
        {isEmpty ? (
          <VStack justifyContent={"center"} minH={"40vh"}>
            <Text fontSize={"lg"} color={"gray.500"}>
              저장한 항목이 없습니다.
            </Text>
            <Text color={"gray.400"}>
              마음에 드는 숙소나 체험의 하트를 눈러 저장해보세요.
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={12}>
            {/* 숙소 섹션 */}
            {allRooms.length > 0 && (
              <Box>
                <HStack mb={4} spacing={2} align="center">
                  <Heading size={"md"}>숙소</Heading>
                  <Text color="gray.400" fontSize="sm">({allRooms.length})</Text>
                </HStack>
                <Divider mb={6} />
                <Grid
                  columnGap={"4"}
                  rowGap={"8"}
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                    "2xl": "repeat(5, 1fr)",
                  }}
                >
                  {allRooms.map((room) => (
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
                      isWishlisted={wishlistedRoomPks.has(room.pk)}
                      onToggleWishlist={() => roomToggleMutation.mutate(room.pk)}
                    />
                  ))}
                </Grid>
              </Box>
            )}

            {/* 체험 섹션 */}
            {allExperiences.length > 0 && (
              <Box>
                <HStack mb={4} spacing={2} align="center">
                  <Heading size={"md"}>체험</Heading>
                  <Text color="gray.400" fontSize="sm">({allExperiences.length})</Text>
                </HStack>
                <Divider mb={6} />
                <Grid
                  columnGap={"4"}
                  rowGap={"8"}
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                    "2xl": "repeat(5, 1fr)",
                  }}
                >
                  {allExperiences.map((exp) => (
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
                      onToggleWishlist={() => expToggleMutation.mutate(exp.pk)}
                    />
                  ))}
                </Grid>
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </ProtectedPage>
  );
}
