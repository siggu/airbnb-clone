import { HStack, Divider, VStack, Button, Box, Text } from "@chakra-ui/react";
import { FaGithub, FaComment } from "react-icons/fa";

export default function SocialLogin() {
  // const kakaoParams = {
  //   response_type: "code",
  //   client_id: "564d95aa68dfb025d4f3726ecaac2764",
  //   redirect_uri:
  //     process.env.REACT_APP_KAKAO_REDIRECT_URI ||
  //     `${window.location.origin}/social/kakao`,
  // };
  // const params = new URLSearchParams(kakaoParams).toString();
  const githubRedirectUri =
    process.env.REACT_APP_GITHUB_REDIRECT_URI ||
    `${window.location.origin}/social/github`;
  const githubParams = new URLSearchParams({
    client_id: "10136d2489a8c313cbe4",
    scope: "read:user,user:email",
    redirect_uri: githubRedirectUri,
  }).toString();
  return (
    <Box mb='4'>
      <HStack my={8}>
        <Divider flex={1} />
        <Text whiteSpace={"nowrap"} color='gray' fontSize={"xs"} as='b' px={2}>
          또는
        </Text>
        <Divider flex={1} />
      </HStack>
      <VStack>
        <Button
          as='a'
          href={`https://github.com/login/oauth/authorize?${githubParams}`}
          w='100%'
          leftIcon={<FaGithub />}
          fontSize={{ base: "xs", sm: "sm" }}
        >
          GitHub으로 계속하기
        </Button>
        <Button
          w='100%'
          leftIcon={<FaComment />}
          colorScheme='yellow'
          fontSize={{ base: "xs", sm: "sm" }}
          isDisabled
          cursor='not-allowed'
        >
          카카오로 계속하기 (준비 중)
        </Button>
      </VStack>
    </Box>
  );
}
