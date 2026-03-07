import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Skeleton,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import ProtectedPage from "../components/ProtectedPage";
import { FaDollarSign } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IUploadExperienceVariables,
  getExperience,
  updateExperience,
} from "../api";
import { IExperienceDetail } from "../types";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getErrorDetail } from "../lib/getErrorDetail";
import { useEffect } from "react";

export default function EditExperience() {
  const { experiencePk } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<IUploadExperienceVariables>();

  const { data: experience, isLoading } = useQuery<IExperienceDetail>({
    queryKey: ["experiences", experiencePk],
    queryFn: getExperience,
  });

  useEffect(() => {
    if (experience) {
      reset({
        name: experience.name,
        country: experience.country,
        city: experience.city,
        address: experience.address,
        price: experience.price,
        start: experience.start,
        end: experience.end,
        description: experience.description,
        max_participants: experience.max_participants,
      });
    }
  }, [experience, reset]);

  const mutation = useMutation({
    mutationFn: (variables: IUploadExperienceVariables) =>
      updateExperience(experiencePk!, variables),
    onSuccess: () => {
      toast({
        status: "success",
        title: "체험이 수정되었습니다.",
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["experiences", experiencePk] });
      navigate(`/experiences/${experiencePk}`);
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

  const onSubmit = (data: IUploadExperienceVariables) => {
    mutation.mutate(data);
  };

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
        <Container>
          <Helmet>
            <title>체험 수정</title>
          </Helmet>
          <Heading textAlign={"center"}>체험 수정</Heading>
          <Skeleton isLoaded={!isLoading} mt={2} />
          <VStack
            spacing={10}
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
            mt={5}
          >
            <FormControl isRequired>
              <FormLabel>체험 이름</FormLabel>
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
              <FormLabel>가격 (1인)</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaDollarSign />} />
                <Input
                  {...register("price", { required: true, valueAsNumber: true })}
                  type="number"
                  min={0}
                />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>시작 시간</FormLabel>
              <Input {...register("start", { required: true })} type="time" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>종료 시간</FormLabel>
              <Input {...register("end", { required: true })} type="time" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>설명</FormLabel>
              <Textarea {...register("description", { required: true })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>최대 인원</FormLabel>
              <NumberInput min={1}>
                <NumberInputField
                  {...register("max_participants", {
                    required: true,
                    valueAsNumber: true,
                    min: 1,
                  })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button
              type="submit"
              isLoading={mutation.status === "pending"}
              colorScheme={"blue"}
              size={"lg"}
              w={"100%"}
            >
              수정 완료
            </Button>
            <Button
              w={"100%"}
              variant="outline"
              onClick={() => navigate(`/experiences/${experiencePk}`)}
            >
              취소
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
