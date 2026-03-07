import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Image,
  Input,
  Skeleton,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import ProtectedPage from "../components/ProtectedPage";
import { Helmet } from "react-helmet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getExperience, uploadExperiencePhoto, deletePhoto } from "../api";
import { getErrorDetail } from "../lib/getErrorDetail";
import { IExperienceDetail } from "../types";
import { FaTrash } from "react-icons/fa";

interface IUploadPhotoVariables {
  description: string;
}

export default function UploadExperiencePhotos() {
  const { experiencePk } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
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
      if (file.size > 10 * 1024 * 1024) return Promise.reject("파일 크기는 10MB 이하여야 합니다.");
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
      queryClient.invalidateQueries({ queryKey: ["experiences", experiencePk] });
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

  const deleteMutation = useMutation({
    mutationFn: (photoPk: number | string) => deletePhoto(photoPk),
    onSuccess: () => {
      toast({
        title: "사진이 삭제되었습니다.",
        status: "success",
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["experiences", experiencePk] });
    },
    onError: (error: any) => {
      toast({
        title: "사진 삭제에 실패했습니다.",
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
        <Container maxW="container.md">
          <Helmet>
            <title>체험 사진 업로드</title>
          </Helmet>
          <Heading textAlign={"center"}>체험 사진 업로드</Heading>
          <Skeleton isLoaded={!isLoading} mt={2}>
            <Text textAlign={"center"} color={"gray.500"} fontSize={"lg"}>
              {experience?.name}
            </Text>
          </Skeleton>

          {/* 기존 사진 목록 */}
          {(experience?.photos?.length ?? 0) > 0 && (
            <Box mt={8}>
              <Heading size="sm" mb={3}>등록된 사진 ({experience?.photos.length})</Heading>
              <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                {experience?.photos.map((photo) => (
                  <Box key={photo.pk} position="relative" rounded="lg" overflow="hidden">
                    <Image
                      src={photo.file}
                      alt={photo.description}
                      objectFit="cover"
                      w="100%"
                      h="100px"
                    />
                    <IconButton
                      aria-label="사진 삭제"
                      icon={<FaTrash size={12} />}
                      size="xs"
                      colorScheme="blue"
                      position="absolute"
                      top={1}
                      right={1}
                      isLoading={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(photo.pk)}
                    />
                    {photo.description && (
                      <Text fontSize="xs" color="gray.600" mt={1} noOfLines={1}>
                        {photo.description}
                      </Text>
                    )}
                  </Box>
                ))}
              </Grid>
              <Divider mt={6} mb={6} />
            </Box>
          )}

          <VStack
            spacing={5}
            mt={experience?.photos?.length ? 0 : 10}
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
              colorScheme="blue"
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
