import {
  VStack,
  HStack,
  Box,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaRegHeart, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

interface IExperienceProps {
  pk: number;
  name: string;
  city: string;
  country: string;
  price: number;
  start: string;
  end: string;
}

export default function Experience({
  pk,
  name,
  city,
  country,
  price,
  start,
  end,
}: IExperienceProps) {
  const gray = useColorModeValue("gray.600", "gray.300");
  return (
    <Link to={`/experiences/${pk}`}>
      <VStack alignItems={"flex-start"}>
        <Box
          w={"100%"}
          position={"relative"}
          overflow={"hidden"}
          mb={3}
          rounded={"2xl"}
          minH={"250px"}
          bg={"orange.100"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text fontSize={"4xl"}>🎭</Text>
          <Box
            position={"absolute"}
            top={0}
            right={0}
            p={2}
            color={"white"}
            filter={"drop-shadow(0px 1px 2px rgba(0,0,0,0.4))"}
          >
            <FaRegHeart size={"20px"} />
          </Box>
        </Box>
        <Box>
          <HStack justifyContent={"space-between"}>
            <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
              {name}
            </Text>
          </HStack>
          <Text fontSize={"sm"} color={gray}>
            {city}, {country}
          </Text>
        </Box>
        <HStack spacing={1} fontSize={"sm"}>
          <Text as={"b"}>₩{price.toLocaleString()}</Text>
          <Text color={gray}>· 1인 ·</Text>
          <HStack spacing={0.5}>
            <Text color={gray}>{start} ~ {end}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Link>
  );
}
