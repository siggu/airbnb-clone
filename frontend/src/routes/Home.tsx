import { Grid, Heading, Text, VStack } from "@chakra-ui/react";
import RoomSkeleton from "../components/RoomSkeletom";
import { useQuery } from "@tanstack/react-query";
import Room from "../components/Room";
import { getRooms } from "../api";
import { IRoomList } from "../types";
import { Helmet } from "react-helmet";

export default function Home() {
  const { isLoading, data, isError } = useQuery<IRoomList[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
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
      px={{
        sm: 10,
        lg: 20,
      }}
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
      {isLoading ? (
        <>
          <RoomSkeleton />
        </>
      ) : null}
      <Helmet>
        <title>{data ? "Airbnb clone" : "로딩 중..."}</title>
      </Helmet>
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
        />
      ))}
    </Grid>
  );
}
