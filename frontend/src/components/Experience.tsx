import {
  VStack,
  HStack,
  Box,
  Text,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
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
        >
          <Box minH={"250px"} h={"100%"} w={"100%"} p={10} bg={"orange.100"} />
          <Button
            variant={"unstyled"}
            position={"absolute"}
            top={0}
            right={0}
            color={"white"}
          >
            <Box position={"relative"} display={"flex"}>
              <FaHeart size={"24px"} color={"rgba(0,0,0,0.5)"} />
              <Box position={"absolute"} top={0} left={0}>
                <FaRegHeart size={"24px"} color={"white"} />
              </Box>
            </Box>
          </Button>
        </Box>
        <Box>
          <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
            {name}
          </Text>
          <Text fontSize={"sm"} color={gray}>
            {city}, {country}
          </Text>
        </Box>
        <HStack spacing={1} fontSize={"sm"}>
          <Text as={"b"}>₩{price.toLocaleString()}</Text>
          <Text color={gray}>· 1인 ·</Text>
          <Text color={gray}>{start} ~ {end}</Text>
        </HStack>
      </VStack>
    </Link>
  );
}
