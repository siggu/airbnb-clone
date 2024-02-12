import { Heading, VStack, Text, Spinner, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { kakaoLogIn } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function KakaoConfirm() {
  const { search } = useLocation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const code = params.get("code");
  const mutation = useMutation({
    mutationFn: kakaoLogIn,
    onMutate: (data) => {
      console.log("mutation starting");
    },
    onSuccess() {
      toast({
        status: "success",
        title: "Welcome!",
        description: "Happy to have you back!",
      });
      queryClient.refetchQueries({
        queryKey: ["me"],
        exact: true,
      });
      navigate("/");
    },
    onError() {
      toast({
        status: "error",
        title: "Error in Continue with Kakao",
        description: "There's something error with Kakao Log In",
      });
    },
  });
  useEffect(() => {
    if (code) {
      mutation.mutate(code);
    }
  }, []);
  return (
    <VStack justifyContent={"center"} mt={40}>
      <Heading>Processing log in...</Heading>
      <Text>Don't go anywhere.</Text>
      <Spinner size={"lg"} />
    </VStack>
  );
}
