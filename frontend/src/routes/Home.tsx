import { Grid } from "@chakra-ui/react";
import RoomSkeleton from "../components/RoomSkeletom";
import { useQuery } from "@tanstack/react-query";
import Room from "../components/Room";
import { getRooms } from "../api";
import { IRoomList } from "../types";
import { Helmet } from "react-helmet";

export default function Home() {
  const { isLoading, data } = useQuery<IRoomList[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
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
        <title>{data ? "Airbnb clone" : "loading..."}</title>
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
