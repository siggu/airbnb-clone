import { Box, Grid, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";

export default function home() {
  return (
    <Grid
      mt={"10"}
      px={"20"}
      columnGap={"4"}
      rowGap={"8"}
      templateColumns={"repeat(5, 1fr)"}
    >
      <VStack spacing={1} alignItems={"flex-start"}>
        <Box overflow={"hidden"} mb={2} rounded={"3xl"}>
          <Image
            h={"250"}
            src="https://a0.muscache.com/im/pictures/miso/Hosting-706856413814921022/original/0f516c0a-18fc-4d49-b997-112bd1ea2a41.jpeg?im_w=720"
          />
        </Box>
        <Box>
          <Grid gap={2} templateColumns={"5fr 1fr"}>
            <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
              한국 Oedong-eup, Gyeongju
            </Text>
            <HStack spacing={1}>
              <FaStar size={15} />
              <Text>5.0</Text>
            </HStack>
          </Grid>
          <Text fontSize={"sm"} color={"gray.600"}>
            288km 거리
          </Text>
        </Box>
        <Text fontSize={"sm"} color={"gray.600"}>
          <Text as={"b"}>₩593,412 </Text>/박
        </Text>
      </VStack>
    </Grid>
  );
}
