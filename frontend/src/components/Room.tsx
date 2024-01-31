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

interface IRoomProps {
  imageUrl: string;
  name: string;
  rating: number;
  city: string;
  country: string;
  price: number;
}

export default function Room({
  imageUrl,
  name,
  rating,
  city,
  country,
  price,
}: IRoomProps) {
  const gray = useColorModeValue("gray.600", "gray.300");
  return (
    <VStack spacing={1} alignItems={"flex-start"}>
      <Box position={"relative"} overflow={"hidden"} mb={2} rounded={"3xl"}>
        <Image minH={"250"} src={imageUrl} />
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
            {name}
          </Text>
          <HStack
            _hover={{
              color: "red.100",
            }}
            spacing={1}
          >
            <FaStar size={15} />
            <Text>{rating}</Text>
          </HStack>
        </Grid>
        <Text fontSize={"sm"} color={gray}>
          {city}, {country}
        </Text>
      </Box>
      <Text fontSize={"sm"} color={gray}>
        <Text as={"b"}>${price} </Text>/박
      </Text>
    </VStack>
  );
}
