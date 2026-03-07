import { useForm } from "react-hook-form";
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
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FaUserNinja, FaLock } from "react-icons/fa";
import SocialLogin from "./SocialLogin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IUsernameLoginVariables,
  usernameLogIn,
} from "../api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IUsernameLoginVariables>();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: usernameLogIn,
    onMutate: (data) => {
      console.log("mutation starting");
    },
    async onSuccess() {
      await queryClient.refetchQueries({
        queryKey: ["me"],
        exact: true,
      });
      toast({
        title: "다시 오셨군요!",
        status: "success",
      });
      onClose();
      reset();
    },
  });
  const onSubmit = ({ username, password }: IUsernameLoginVariables) => {
    mutation.mutate({ username, password });
  };
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>로그인</ModalHeader>
        <ModalCloseButton />
        <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack>
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
                })}
                variant={"filled"}
                placeholder="아이디"
              />
            </InputGroup>
            <Text fontSize={"sm"} color={"blue.500"}>
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
                })}
                type="password"
                variant={"filled"}
                placeholder="비밀번호"
              />
            </InputGroup>
            <Text fontSize={"sm"} color={"blue.500"}>
              {errors.password?.message}
            </Text>
          </VStack>
          {mutation.isError ? (
            <Text color={"blue.500"} textAlign={"center"} fontSize={"sm"}>
              아이디 또는 비밀번호가 올바르지 않습니다
            </Text>
          ) : null}
          <Button
            isLoading={mutation.status === "pending"}
            type="submit"
            mt={4}
            colorScheme={"blue"}
            w="100%"
          >
            로그인
          </Button>
          <SocialLogin />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
