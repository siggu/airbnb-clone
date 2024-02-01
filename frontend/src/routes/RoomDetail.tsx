import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRoom } from "../api";

export default function RoomDetail() {
  const { roomPk } = useParams();
  const { isLoading, data } = useQuery({
    queryKey: [`rooms`, roomPk],
    queryFn: getRoom,
  });
  return <h1>Hello!</h1>;
}
