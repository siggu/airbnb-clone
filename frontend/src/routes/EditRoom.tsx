import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Skeleton,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import ProtectedPage from "../components/ProtectedPage";
import { FaBed, FaDollarSign, FaToilet } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IUploadRoomVariables,
  getAmenities,
  getCategories,
  getRoom,
  updateRoom,
} from "../api";
import { IAmenity, ICategory, IRoomDetail } from "../types";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getErrorDetail } from "../lib/getErrorDetail";
import { useEffect } from "react";

export default function EditRoom() {
  const { roomPk } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<IUploadRoomVariables>();

  const { data: room, isLoading: isRoomLoading } = useQuery<IRoomDetail>({
    queryKey: ["room", roomPk],
    queryFn: getRoom,
  });

  useEffect(() => {
    if (room) {
      reset({
        name: room.name,
        country: room.country,
        city: room.city,
        address: room.address,
        price: room.price,
        rooms: room.rooms,
        toilets: room.toilets,
        description: room.description,
        pet_friendly: room.pet_friendly,
        kind: room.kind,
        category: room.category?.pk,
        amenities: room.amenities?.map((a) => a.pk),
      });
    }
  }, [room, reset]);

  const { data: amenities } = useQuery<IAmenity[]>({
    queryKey: ["amenities"],
    queryFn: getAmenities,
  });
  const { data: categories } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const mutation = useMutation({
    mutationFn: (variables: IUploadRoomVariables) =>
      updateRoom(roomPk!, variables),
    onSuccess: () => {
      toast({
        status: "success",
        title: "숙소가 수정되었습니다.",
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["room", roomPk] });
      navigate(`/rooms/${roomPk}`);
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

  const onSubmit = (data: IUploadRoomVariables) => {
    mutation.mutate(data);
  };

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
        <Container>
          <Helmet>
            <title>숙소 수정</title>
          </Helmet>
          <Heading textAlign={"center"}>숙소 수정</Heading>
          <Skeleton isLoaded={!isRoomLoading} mt={2} />
          <VStack
            spacing={10}
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
            mt={5}
          >
            <FormControl isRequired>
              <FormLabel>숙소 이름</FormLabel>
              <Input {...register("name", { required: true })} type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>국가</FormLabel>
              <Input {...register("country", { required: true })} type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>도시</FormLabel>
              <Input {...register("city", { required: true })} type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>주소</FormLabel>
              <Input {...register("address", { required: true })} type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>가격</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaDollarSign />} />
                <Input
                  {...register("price", { required: true })}
                  type="number"
                  min={0}
                />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>침실 수</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaBed />} />
                <Input
                  {...register("rooms", { required: true })}
                  type="number"
                  min={0}
                />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>욕실 수</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaToilet />} />
                <Input
                  {...register("toilets", { required: true })}
                  type="number"
                  min={0}
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>설명</FormLabel>
              <Textarea {...register("description")} />
            </FormControl>
            <FormControl>
              <Checkbox {...register("pet_friendly")}>반려동물 허용</Checkbox>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>숙소 유형</FormLabel>
              <Select {...register("kind", { required: true })} placeholder="유형 선택">
                <option value="entire_place">집 전체</option>
                <option value="private_room">개인실</option>
                <option value="shared_room">공유 공간</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>카테고리</FormLabel>
              <Select {...register("category", { required: true })} placeholder="카테고리 선택">
                {categories?.map((c) => (
                  <option key={c.pk} value={c.pk}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>편의시설</FormLabel>
              <Grid templateColumns={"1fr 1fr"} gap={5}>
                {amenities?.map((amenity) => (
                  <Box key={amenity.pk}>
                    <Checkbox
                      value={amenity.pk}
                      {...register("amenities")}
                    >
                      {amenity.name}
                    </Checkbox>
                  </Box>
                ))}
              </Grid>
            </FormControl>
            <Button
              type="submit"
              isLoading={mutation.status === "pending"}
              colorScheme={"red"}
              size={"lg"}
              w={"100%"}
            >
              수정 완료
            </Button>
            <Button
              w={"100%"}
              variant="outline"
              onClick={() => navigate(`/rooms/${roomPk}`)}
            >
              취소
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
