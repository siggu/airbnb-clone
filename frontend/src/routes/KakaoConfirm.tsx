import { Heading, VStack, Text, Spinner, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { kakaoLogIn } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { getErrorDetail } from "../lib/getErrorDetail";

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
    async onSuccess() {
      await queryClient.refetchQueries({
        queryKey: ["me"],
        exact: true,
      });
      toast({
        status: "success",
        title: "환영합니다!",
        description: "다시 만나서 반갑습니다!",
        position: "bottom-right",
      });
      navigate("/");
    },
    onError(error: any) {
      toast({
        status: "error",
        title: "카카오 로그인 오류",
        description: getErrorDetail(error),
        position: "bottom-right",
      });
      navigate("/");
    },
  });
  useEffect(() => {
    if (code) {
      mutation.mutate(code);
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <VStack justifyContent={"center"} mt={40}>
      <Helmet>
        <title>Kakao LogIn</title>
      </Helmet>
      <Heading>로그인 중...</Heading>
      <Text>이 창을 떠나지 마세요.</Text>
      <Spinner size={"lg"} />
    </VStack>
  );
}
