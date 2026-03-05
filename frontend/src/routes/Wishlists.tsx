import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { createWishlist, getWishlists, toggleWishlistRoom } from "../api";
import { IWishlist } from "../types";
import Room from "../components/Room";
import ProtectedPage from "../components/ProtectedPage";
import { getErrorDetail } from "../lib/getErrorDetail";

export default function Wishlists() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: wishlists, isLoading } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
  });

  const wishlistedPks = new Set(
    wishlists?.flatMap((w) => w.rooms.map((r) => r.pk)) ?? []
  );

  const toggleMutation = useMutation({
    mutationFn: async (roomPk: number) => {
      if (!wishlists || wishlists.length === 0) {
        const newWishlist = await createWishlist("내 위시리스트");
        return toggleWishlistRoom(newWishlist.pk, roomPk);
      }
      return toggleWishlistRoom(wishlists[0].pk, roomPk);
    },
    onSuccess: (_, roomPk) => {
      const wasWishlisted = wishlistedPks.has(roomPk);
      toast({
        title: wasWishlisted ? "위시리스트에서 제거되었습니다." : "위시리스트에 저장되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 2000,
      });
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

  const allRooms = wishlists?.flatMap((w) => w.rooms) ?? [];
  const allWishlistedPks = new Set(allRooms.map((r) => r.pk));

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 20 }}>
        <Helmet>
          <title>위시리스트 — Airbnb clone</title>
        </Helmet>
        <Heading mb={6}>위시리스트</Heading>
        {!isLoading && wishlists?.length === 0 ? (
          <VStack justifyContent={"center"} minH={"40vh"}>
            <Text fontSize={"lg"} color={"gray.500"}>
              저장한 숙소가 없습니다.
            </Text>
            <Text color={"gray.400"}>
              마음에 드는 숙소의 하트를 눌러 저장해보세요.
            </Text>
          </VStack>
        ) : (
          wishlists?.map((wishlist) =>
            wishlist.rooms.length > 0 ? (
              <Box key={wishlist.pk} mb={10}>
                <Heading size={"md"} mb={4}>
                  {wishlist.name}
                </Heading>
                <Divider mb={6} />
                <Grid
                  columnGap={"4"}
                  rowGap={"8"}
                  templateColumns={{
                    sm: "1fr",
                    md: "2fr",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                    "2xl": "repeat(5, 1fr)",
                  }}
                >
                  {wishlist.rooms.map((room) => (
                    <Room
                      key={room.pk}
                      pk={room.pk}
                      isOwner={room.is_owner}
                      imageUrl={
                        room.photos[0]?.file ??
                        `https://source.unsplash.com/random/450x450`
                      }
                      name={room.name}
                      rating={room.rating}
                      city={room.city}
                      country={room.country}
                      price={room.price}
                      isWishlisted={allWishlistedPks.has(room.pk)}
                      onToggleWishlist={() => toggleMutation.mutate(room.pk)}
                    />
                  ))}
                </Grid>
              </Box>
            ) : null
          )
        )}
      </Box>
    </ProtectedPage>
  );
}
