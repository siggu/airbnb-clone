import { HStack, Divider, VStack, Button, Box, Text } from "@chakra-ui/react";
import { FaGithub, FaComment } from "react-icons/fa";

export default function SocialLogin() {
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
        <Button w="100%" leftIcon={<FaGithub />}>
          Continue with Github
        </Button>
        <Button w="100%" leftIcon={<FaComment />} colorScheme="yellow">
          Continue with Kakao
        </Button>
      </VStack>
    </Box>
  );
}
