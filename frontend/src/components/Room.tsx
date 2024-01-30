import {
  VStack,
  Grid,
  HStack,
  Box,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaRegHeart, FaStar } from "react-icons/fa";

export default function Room() {
  const gray = useColorModeValue("gray.600", "gray.300");
  return (
    <VStack spacing={1} alignItems={"flex-start"}>
      <Box position={"relative"} overflow={"hidden"} mb={2} rounded={"3xl"}>
        <Image
          minH={"250"}
          src="https://a0.muscache.com/im/pictures/miso/Hosting-706856413814921022/original/0f516c0a-18fc-4d49-b997-112bd1ea2a41.jpeg?im_w=720"
        />
        <Box
          cursor={"pointer"}
          position={"absolute"}
          top={5}
          right={5}
          color={"white"}
        >
          <FaRegHeart size={"20px"} />
        </Box>
      </Box>
      <Box>
        <Grid gap={2} templateColumns={"5fr 1fr"}>
          <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
            한국 Oedong-eup, Gyeongju
          </Text>
          <HStack
            _hover={{
              color: "red.100",
            }}
            spacing={1}
          >
            <FaStar size={15} />
            <Text>5.0</Text>
          </HStack>
        </Grid>
        <Text fontSize={"sm"} color={gray}>
          288km 거리
        </Text>
      </Box>
      <Text fontSize={"sm"} color={gray}>
        <Text as={"b"}>₩593,412 </Text>/박
      </Text>
    </VStack>
  );
}
