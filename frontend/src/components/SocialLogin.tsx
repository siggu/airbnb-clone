import { HStack, Divider, VStack, Button, Box, Text } from "@chakra-ui/react";
import { FaGithub, FaComment } from "react-icons/fa";

export default function SocialLogin() {
  const kakaoParams = {
    response_type: "code",
    client_id: "564d95aa68dfb025d4f3726ecaac2764",
    redirect_uri:
      process.env.REACT_APP_KAKAO_REDIRECT_URI ||
      `${window.location.origin}/social/kakao`,
  };
  const params = new URLSearchParams(kakaoParams).toString();
  const githubRedirectUri =
    process.env.REACT_APP_GITHUB_REDIRECT_URI ||
    `${window.location.origin}/social/github`;
  const githubParams = new URLSearchParams({
    client_id: "10136d2489a8c313cbe4",
    scope: "read:user,user:email",
    redirect_uri: githubRedirectUri,
  }).toString();
  return (
    <Box mb="4">
      <HStack my={8}>
        <Divider />
        <Text textTransform={"uppercase"} color="gray" fontSize={"xs"} as="b">
          Or
        </Text>
        <Divider />
      </HStack>
      <VStack>
        <Button
          as="a"
          href={`https://github.com/login/oauth/authorize?${githubParams}`}
          w="100%"
          leftIcon={<FaGithub />}
        >
          Continue with Github
        </Button>
        <Button
          as={"a"}
          href={`https://kauth.kakao.com/oauth/authorize?${params}`}
          w="100%"
          leftIcon={<FaComment />}
          colorScheme="yellow"
        >
          Continue with Kakao
        </Button>
      </VStack>
    </Box>
  );
}
