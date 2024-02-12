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
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ISignUpVariables, signUp } from "../api";

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
    onSuccess() {
      toast({
        title: "sign up success!",
        status: "success",
      });
      onClose();
      reset();
      queryClient.refetchQueries({
        queryKey: ["me"],
      });
    },
    onError(errors) {
      toast({
        title: "Error on Sign Up",
        status: "error",
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
        <ModalHeader>Sign up</ModalHeader>
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
                  required: "Please write a name",
                  minLength: {
                    value: 3,
                    message: "name must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[A-za-z0-9가-힣]{2,20}$/,
                    message: "name must consist of english, korean, number",
                  },
                })}
                variant={"filled"}
                placeholder="name"
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
                  required: "Please write a email",
                  minLength: {
                    value: 8,
                    message: "email must be at least8 characters",
                  },
                  pattern: {
                    value: /\w+@\w+\.\w+(\.\w+)?$/,
                    message: "It must be written in email format.",
                  },
                })}
                variant={"filled"}
                placeholder="email"
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
                  required: "Please write a username",
                  minLength: {
                    value: 3,
                    message: "username must be at least 3 characters.",
                  },
                })}
                variant={"filled"}
                placeholder="username"
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
                  required: "password is necessary!",
                  minLength: {
                    value: 8,
                    message: "password must be at least 8 characters.",
                  },
                  maxLength: {
                    value: 15,
                    message: "password must be a maximum of 15 characters.",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-zA-Z])(?=.*[~!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
                    message: "The password must contain one of ~!@#$%^*+=-.",
                  },
                })}
                type="password"
                variant={"filled"}
                placeholder="password"
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
            Sign up
          </Button>
          <SocialLogin />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
