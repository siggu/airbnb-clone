import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Textarea,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import ProtectedPage from "../components/ProtectedPage";
import { FaDollarSign } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import {
  IUploadExperienceVariables,
  uploadExperience,
} from "../api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { getErrorDetail } from "../lib/getErrorDetail";

export default function UploadExperience() {
  const { register, handleSubmit } = useForm<IUploadExperienceVariables>();
  const toast = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: uploadExperience,
    onSuccess: (data: any) => {
      toast({
        status: "success",
        title: "체험이 등록되었습니다",
        position: "bottom-right",
      });
      navigate(`/experiences/${data.pk}`);
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
            <title>체험 등록</title>
          </Helmet>
          <Heading textAlign={"center"}>체험 등록</Heading>
          <VStack
            spacing={10}
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
            mt={5}
          >
            <FormControl isRequired>
              <FormLabel>체험 이름</FormLabel>
              <Input
                {...register("name", { required: true })}
                type="text"
              />
              <FormHelperText>체험 이름을 입력해주세요</FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>국가</FormLabel>
              <Input
                {...register("country", { required: true })}
                type="text"
                defaultValue="한국"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>도시</FormLabel>
              <Input
                {...register("city", { required: true })}
                type="text"
                defaultValue="서울"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>주소</FormLabel>
              <Input
                {...register("address", { required: true })}
                type="text"
              />
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
              <Input
                {...register("start", { required: true })}
                type="time"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>종료 시간</FormLabel>
              <Input
                {...register("end", { required: true })}
                type="time"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>설명</FormLabel>
              <Textarea {...register("description", { required: true })} />
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
              체험 등록하기
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
