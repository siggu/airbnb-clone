import { Heading, VStack, Text, Spinner, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { githubLogIn } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";

export default function GithubConfirm() {
  const { search } = useLocation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const code = params.get("code");
  const mutation = useMutation({
    mutationFn: githubLogIn,
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
        status: "warning",
        title: "Error in Continue with Github",
        description: "There's something error with GitHub Log In",
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
      <Helmet>
        <title>GibHub LogIn</title>
      </Helmet>
      <Heading>Processing log in...</Heading>
      <Text>Don't go anywhere.</Text>
      <Spinner size={"lg"} />
    </VStack>
  );
}
