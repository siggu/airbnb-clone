import { Grid, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import RoomSkeleton from "../components/RoomSkeletom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Room from "../components/Room";
import { createWishlist, getRooms, getWishlists, toggleWishlistRoom } from "../api";
import { IRoomList, IWishlist } from "../types";
import { Helmet } from "react-helmet";
import useUser from "../lib/useUser";

export default function Home() {
  const { isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isLoading, data, isError } = useQuery<IRoomList[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const { data: wishlists } = useQuery<IWishlist[]>({
    queryKey: ["wishlists"],
    queryFn: getWishlists,
    enabled: isLoggedIn,
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
    onError: () => {
      toast({
        title: "오류가 발생했습니다.",
        status: "error",
        position: "bottom-right",
        duration: 2000,
      });
    },
  });

  if (isError) {
    return (
      <VStack justifyContent={"center"} minH={"50vh"}>
        <Helmet>
          <title>오류 — Airbnb clone</title>
        </Helmet>
        <Heading>오류가 발생했습니다.</Heading>
        <Text>숙소를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</Text>
      </VStack>
    );
  }
  return (
    <Grid
      mt={"10"}
      px={{ sm: 10, lg: 20 }}
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
      <Helmet>
        <title>{data ? "Airbnb clone" : "로딩 중..."}</title>
      </Helmet>
      {isLoading ? <RoomSkeleton /> : null}
      {data?.map((room) => (
        <Room
          key={room.pk}
          pk={room.pk}
          isOwner={room.is_owner}
          imageUrl={
            room.photos[0]?.file ?? `https://source.unsplash.com/random/450x450`
          }
          name={room.name}
          rating={room.rating}
          city={room.city}
          country={room.country}
          price={room.price}
          isWishlisted={wishlistedPks.has(room.pk)}
          onToggleWishlist={
            isLoggedIn
              ? () => toggleMutation.mutate(room.pk)
              : () =>
                  toast({
                    title: "로그인이 필요합니다.",
                    status: "warning",
                    position: "bottom-right",
                    duration: 2000,
                  })
          }
        />
      ))}
    </Grid>
  );
}
