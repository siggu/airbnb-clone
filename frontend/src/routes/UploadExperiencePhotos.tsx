import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Skeleton,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import ProtectedPage from "../components/ProtectedPage";
import { Helmet } from "react-helmet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getExperience, uploadExperiencePhoto } from "../api";
import { getErrorDetail } from "../lib/getErrorDetail";
import { IExperienceDetail } from "../types";

interface IUploadPhotoVariables {
  description: string;
}

export default function UploadExperiencePhotos() {
  const { experiencePk } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<IUploadPhotoVariables>();

  const { data: experience, isLoading } = useQuery<IExperienceDetail>({
    queryKey: ["experiences", experiencePk],
    queryFn: getExperience,
  });

  const mutation = useMutation({
    mutationFn: (variables: IUploadPhotoVariables) => {
      const file = fileRef.current?.files?.[0];
      if (!file) return Promise.reject("파일을 선택해주세요.");
      return uploadExperiencePhoto(experiencePk!, file, variables.description);
    },
    onSuccess: () => {
      toast({
        title: "사진이 업로드되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      reset();
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (error: any) => {
      toast({
        title: "사진 업로드에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: IUploadPhotoVariables) => {
    mutation.mutate(data);
  };

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
        <Container>
          <Helmet>
            <title>체험 사진 업로드</title>
          </Helmet>
          <Heading textAlign={"center"}>체험 사진 업로드</Heading>
          <Skeleton isLoaded={!isLoading} mt={2}>
            <Text textAlign={"center"} color={"gray.500"} fontSize={"lg"}>
              {experience?.name}
            </Text>
          </Skeleton>
          <VStack
            spacing={5}
            mt={10}
            as="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormControl isRequired>
              <FormLabel>사진 파일</FormLabel>
              <Input ref={fileRef} type="file" accept="image/*" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>설명</FormLabel>
              <Input
                {...register("description", { required: true })}
                placeholder="사진 설명을 입력해주세요"
              />
            </FormControl>
            <Button
              type="submit"
              w={"full"}
              colorScheme="red"
              isLoading={mutation.isPending}
            >
              사진 업로드
            </Button>
            <Button
              w={"full"}
              variant="outline"
              onClick={() => navigate(`/experiences/${experiencePk}`)}
            >
              체험으로 돌아가기
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
