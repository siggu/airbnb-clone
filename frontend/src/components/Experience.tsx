import {
  VStack,
  HStack,
  Box,
  Image,
  Text,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { FaCamera, FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

interface IExperienceProps {
  pk: number;
  name: string;
  city: string;
  country: string;
  price: number;
  start: string;
  end: string;
  imageUrl?: string;
  isOwner?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

export default function Experience({
  pk,
  name,
  city,
  country,
  price,
  start,
  end,
  imageUrl,
  isOwner,
  isWishlisted,
  onToggleWishlist,
}: IExperienceProps) {
  const gray = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();

  const onCameraClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(`/experiences/${pk}/photos`);
  };

  const onHeartClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onToggleWishlist?.();
  };

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
          {imageUrl ? (
            <Image objectFit={"cover"} minH={"250"} src={imageUrl} />
          ) : (
            <Box
              minH={"250px"}
              h={"100%"}
              w={"100%"}
              p={10}
              bg={"gray.200"}
              _dark={{ bg: "gray.600" }}
            />
          )}
          {isOwner ? (
            <Button
              variant={"unstyled"}
              position={"absolute"}
              top={0}
              right={0}
              onClick={onCameraClick}
              color={"white"}
            >
              <FaCamera size={"20px"} />
            </Button>
          ) : (
            <Button
              variant={"unstyled"}
              position={"absolute"}
              top={0}
              right={0}
              onClick={onHeartClick}
              color={"white"}
            >
              <Box position={"relative"} display={"flex"}>
                <FaHeart size={"20px"} color={isWishlisted ? "rgba(66,153,225,0.85)" : "rgba(0,0,0,0.5)"} />
                <Box position={"absolute"} top={0} left={0}>
                  <FaRegHeart size={"20px"} color={"white"} />
                </Box>
              </Box>
            </Button>
          )}
        </Box>
        <Box>
          <Text display={"block"} noOfLines={1} as='b' fontSize={"md"}>
            {name}
          </Text>
          <Text fontSize={"sm"} color={gray}>
            {city}, {country}
          </Text>
        </Box>
        <HStack spacing={1} fontSize={"sm"}>
          <Text as={"b"}>₩{price.toLocaleString()}</Text>
          <Text color={gray}>· 1인 ·</Text>
          <Text color={gray}>
            {start} ~ {end}
          </Text>
        </HStack>
      </VStack>
    </Link>
  );
}
