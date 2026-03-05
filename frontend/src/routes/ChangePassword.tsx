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
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { IChangePasswordVariables, changePassword } from "../api";
import ProtectedPage from "../components/ProtectedPage";
import { Helmet } from "react-helmet";
import { getErrorDetail } from "../lib/getErrorDetail";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<IChangePasswordVariables>();

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: "비밀번호가 변경되었습니다.",
        status: "success",
        position: "bottom-right",
        duration: 3000,
      });
      reset();
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "비밀번호 변경에 실패했습니다.",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: IChangePasswordVariables) => {
    mutation.mutate(data);
  };

  return (
    <ProtectedPage>
      <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
        <Container>
          <Helmet>
            <title>비밀번호 변경</title>
          </Helmet>
          <Heading textAlign={"center"}>비밀번호 변경</Heading>
          <VStack
            spacing={6}
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
            mt={8}
          >
            <FormControl isRequired>
              <FormLabel>현재 비밀번호</FormLabel>
              <Input
                {...register("old_password", { required: true })}
                type="password"
                placeholder="현재 비밀번호를 입력해주세요"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>새 비밀번호</FormLabel>
              <Input
                {...register("new_password", { required: true })}
                type="password"
                placeholder="새 비밀번호를 입력해주세요"
              />
            </FormControl>
            <Button
              type="submit"
              isLoading={mutation.status === "pending"}
              colorScheme={"red"}
              size={"lg"}
              w={"100%"}
            >
              비밀번호 변경
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
