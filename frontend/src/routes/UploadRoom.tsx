import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Textarea,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import useHostOnlyPage from "../components/HostOnlyPage";
import ProtectedPage from "../components/ProtectedPage";
import { FaBed, FaDollarSign, FaToilet } from "react-icons/fa";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IUploadRoomVariables,
  getAmenities,
  getCategories,
  uploadRoom,
} from "../api";
import { IAmenity, ICategory, IRoomDetail } from "../types";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function UploadRoom() {
  const { register, handleSubmit } = useForm<IUploadRoomVariables>();
  const toast = useToast();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: uploadRoom,
    onSuccess: (data: IRoomDetail) => {
      toast({
        status: "success",
        title: "숙소가 등록되었습니다",
        position: "bottom-right",
      });
      navigate(`/rooms/${data.pk}`);
    },
  });
  const { data: amenities } = useQuery<IAmenity[]>({
    queryKey: ["amenities"],
    queryFn: getAmenities,
  });
  const { data: categories } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  useHostOnlyPage();
  const onSubmit = (data: IUploadRoomVariables) => {
    mutation.mutate(data);
  };
  return (
    <ProtectedPage>
      <Box
        pb={40}
        mt={10}
        px={{
          base: 10,
          lg: 40,
        }}
      >
        <Container>
          <Helmet>
            <title>
              {amenities && categories ? "숙소 등록" : "로딩 중..."}
            </title>
          </Helmet>
          <Heading textAlign={"center"}>숙소 등록</Heading>
          <VStack
            spacing={10}
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
            mt={5}
          >
            <FormControl isRequired>
              <FormLabel>숙소 이름</FormLabel>
              <Input
                {...register("name", { required: true })}
                required
                type="text"
              />
              <FormHelperText>숙소 이름을 입력해주세요</FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>국가</FormLabel>
              <Input
                {...register("country", { required: true })}
                required
                type="text"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>도시</FormLabel>
              <Input
                {...register("city", { required: true })}
                required
                type="text"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>주소</FormLabel>
              <Input
                {...register("address", { required: true })}
                required
                type="text"
              />
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
              <Textarea {...register("description", { required: true })} />
            </FormControl>
            <FormControl>
              <Checkbox {...register("pet_friendly")}>반려동물 허용</Checkbox>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>숙소 유형</FormLabel>
              <Select
                {...register("kind", { required: true })}
                placeholder="유형 선택"
              >
                <option value="entire_place">집 전체</option>
                <option value="private_room">개인실</option>
                <option value="shared_room">공유 공간</option>
              </Select>
              <FormHelperText>
                어떤 유형의 숙소를 제공하시나요?
              </FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>카테고리</FormLabel>
              <Select
                {...register("category", { required: true })}
                placeholder="카테고리 선택"
              >
                {categories?.map((cateogry) => (
                  <option key={cateogry.pk} value={cateogry.pk}>
                    {cateogry.name}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                숙소에 맞는 카테고리를 선택해주세요
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>편의시설</FormLabel>
              <Grid templateColumns={"1fr 1fr"} gap={5}>
                {amenities?.map((amenity) => (
                  <Box key={amenity.pk}>
                    <Checkbox
                      value={amenity.pk}
                      {...register("amenities", { required: true })}
                    >
                      {amenity.name}
                    </Checkbox>
                    <FormHelperText>{amenity.description}</FormHelperText>
                  </Box>
                ))}
              </Grid>
            </FormControl>
            {mutation.isError ? (
              <Text color={"red.500"}>오류가 발생했습니다</Text>
            ) : null}
            <Button
              type="submit"
              isLoading={mutation.status === "pending"}
              colorScheme={"red"}
              size={"lg"}
              w={"100%"}
            >
              숙소 등록하기
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
