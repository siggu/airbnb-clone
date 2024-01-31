import { Grid } from "@chakra-ui/react";
import RoomSkeleton from "../components/RoomSkeletom";
import { useQuery } from "@tanstack/react-query";
import Room from "../components/Room";
import { getRooms } from "../api";

interface IPhoto {
  pk: string;
  file: string;
  description: string;
}

interface IRoom {
  pk: number;
  name: string;
  country: string;
  city: string;
  price: number;
  rating: number;
  is_owner: boolean;
  photos: IPhoto[];
}

export default function Home() {
  const { isLoading, data } = useQuery<IRoom[]>({
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
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
        </>
      ) : null}
      {data?.map((room) => (
        <Room
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
