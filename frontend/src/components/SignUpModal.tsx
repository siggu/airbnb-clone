import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  useToast,
  Text,
} from "@chakra-ui/react";
import { FaUserNinja, FaLock, FaEnvelope, FaUserSecret } from "react-icons/fa";
import SocialLogin from "./SocialLogin";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ISignUpVariables, signUp } from "../api";
import { getErrorDetail } from "../lib/getErrorDetail";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ISignUpVariables>();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: signUp,
    onMutate: (data) => {
      console.log("mutation starting");
    },
    async onSuccess() {
      await queryClient.refetchQueries({
        queryKey: ["me"],
        exact: true,
      });
      toast({
        title: "회원가입이 완료되었습니다!",
        status: "success",
      });
      onClose();
      reset();
    },
    onError(error: any) {
      toast({
        title: "회원가입 중 오류가 발생했습니다",
        description: getErrorDetail(error),
        status: "error",
        position: "bottom-right",
      });
    },
  });
  const onSubmit = ({ name, email, username, password }: ISignUpVariables) => {
    mutation.mutate({ name, email, username, password });
  };
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>회원가입</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={"form"} onSubmit={handleSubmit(onSubmit)}>
          <VStack>
            <InputGroup>
              <InputLeftElement
                children={
                  <Box color={"gray.500"}>
                    <FaUserSecret />
                  </Box>
                }
              />
              <Input
                isInvalid={Boolean(errors.name?.message)}
                {...register("name", {
                  required: "이름을 입력해주세요",
                  minLength: {
                    value: 3,
                    message: "이름은 최소 3자 이상이어야 합니다",
                  },
                  pattern: {
                    value: /^[A-za-z0-9가-힣]{2,20}$/,
                    message: "이름은 영문, 한글, 숫자만 사용 가능합니다",
                  },
                })}
                variant={"filled"}
                placeholder="이름"
              />
            </InputGroup>
            <Text fontSize={"sm"} color={"red.500"}>
              {errors.name?.message}
            </Text>
            <InputGroup>
              <InputLeftElement
                children={
                  <Box color={"gray.500"}>
                    <FaEnvelope />
                  </Box>
                }
              />
              <Input
                isInvalid={Boolean(errors.email?.message)}
                {...register("email", {
                  required: "이메일을 입력해주세요",
                  minLength: {
                    value: 8,
                    message: "이메일은 최소 8자 이상이어야 합니다",
                  },
                  pattern: {
                    value: /\w+@\w+\.\w+(\.\w+)?$/,
                    message: "올바른 이메일 형식으로 입력해주세요",
                  },
                })}
                variant={"filled"}
                placeholder="이메일"
              />
            </InputGroup>
            <Text fontSize={"sm"} color={"red.500"}>
              {errors.email?.message}
            </Text>
            <InputGroup>
              <InputLeftElement
                children={
                  <Box color={"gray.500"}>
                    <FaUserNinja />
                  </Box>
                }
              />
              <Input
                isInvalid={Boolean(errors.username?.message)}
                {...register("username", {
                  required: "아이디를 입력해주세요",
                  minLength: {
                    value: 3,
                    message: "아이디는 최소 3자 이상이어야 합니다",
                  },
                })}
                variant={"filled"}
                placeholder="아이디"
              />
            </InputGroup>
            <Text fontSize={"sm"} color={"red.500"}>
              {errors.username?.message}
            </Text>
            <InputGroup>
              <InputLeftElement
                children={
                  <Box color={"gray.500"}>
                    <FaLock />
                  </Box>
                }
              />
              <Input
                isInvalid={Boolean(errors.password?.message)}
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 최소 8자 이상이어야 합니다",
                  },
                  maxLength: {
                    value: 15,
                    message: "비밀번호는 최대 15자까지 입력 가능합니다",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-zA-Z])(?=.*[~!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
                    message: "비밀번호에는 ~!@#$%^*+=- 중 하나가 포함되어야 합니다",
                  },
                })}
                type="password"
                variant={"filled"}
                placeholder="비밀번호"
              />
            </InputGroup>
            <Text fontSize={"sm"} color={"red.500"}>
              {errors.password?.message}
            </Text>
          </VStack>
          <Button
            isLoading={mutation.status === "pending"}
            type="submit"
            mt={"4"}
            colorScheme="red"
            w="100%"
          >
            회원가입
          </Button>
          <SocialLogin />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
