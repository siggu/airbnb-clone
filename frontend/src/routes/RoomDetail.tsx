import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRoom } from "../api";

export default function RoomDetail() {
  const { roomPk } = useParams();
  const { isLoading, data } = useQuery({
    queryKey: [`room:${roomPk}`],
    queryFn: getRoom,
  });
  console.log(data);
  return <h1>Hello!</h1>;
}
