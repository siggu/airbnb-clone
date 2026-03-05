import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import useHostOnlyPage from "../components/HostOnlyPage";
import ProtectedPage from "../components/ProtectedPage";
import { Helmet } from "react-helmet";
import { useMutation } from "@tanstack/react-query";
import { uploadPhoto } from "../api";

interface IUploadPhotoVariables {
  description: string;
}

export default function UploadPhotos() {
  const { roomPk } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  useHostOnlyPage();
  const { register, handleSubmit, reset } = useForm<IUploadPhotoVariables>();

  const mutation = useMutation({
    mutationFn: (variables: IUploadPhotoVariables) => {
      const file = fileRef.current?.files?.[0];
      if (!file) return Promise.reject("파일을 선택해주세요.");
      return uploadPhoto(roomPk!, file, variables.description);
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
    onError: () => {
      toast({
        title: "사진 업로드에 실패했습니다.",
        status: "error",
        position: "bottom-right",
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
            <title>사진 업로드</title>
          </Helmet>
          <Heading textAlign={"center"}>사진 업로드</Heading>
          <VStack
            spacing={5}
            mt={10}
            as="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormControl isRequired>
              <FormLabel>사진 파일</FormLabel>
              <Input
                ref={fileRef}
                type="file"
                accept="image/*"
              />
            </FormControl>
            <FormControl>
              <FormLabel>설명 (선택)</FormLabel>
              <Input
                {...register("description")}
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
              onClick={() => navigate(`/rooms/${roomPk}`)}
            >
              숙소로 돌아가기
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
