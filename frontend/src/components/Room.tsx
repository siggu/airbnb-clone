import {
  VStack,
  HStack,
  Box,
  Image,
  Text,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { FaCamera, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

interface IRoomProps {
  imageUrl: string;
  name: string;
  rating: number | string;
  city: string;
  country: string;
  price: number;
  pk: number;
  isOwner: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

export default function Room({
  pk,
  imageUrl,
  name,
  rating,
  city,
  country,
  price,
  isOwner,
  isWishlisted,
  onToggleWishlist,
}: IRoomProps) {
  const gray = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();
  const onCameraClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(`/rooms/${pk}/photos`);
  };
  const onHeartClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onToggleWishlist?.();
  };
  return (
    <Link to={`/rooms/${pk}`}>
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
            <Box minH={"280px"} h={"100%"} w={"100%"} bg={"red.400"} />
          )}
          {isOwner ? (
            <Button
              variant={"unstyled"}
              position={"absolute"}
              top={3}
              right={3}
              p={0}
              minW={"auto"}
              h={"auto"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              onClick={onCameraClick}
              color={"white"}
            >
              <FaCamera size={"24px"} />
            </Button>
          ) : onToggleWishlist ? (
            <Button
              variant={"unstyled"}
              position={"absolute"}
              top={3}
              right={3}
              p={0}
              minW={"auto"}
              h={"auto"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              onClick={onHeartClick}
              color={"white"}
            >
              {isWishlisted ? (
                <FaHeart size={"24px"} color={"rgba(255,56,92,0.85)"} />
              ) : (
                <Box position={"relative"} display={"flex"}>
                  <FaHeart size={"24px"} color={"rgba(0,0,0,0.5)"} />
                  <Box position={"absolute"} top={0} left={0}>
                    <FaRegHeart size={"24px"} color={"white"} />
                  </Box>
                </Box>
              )}
            </Button>
          ) : null}
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
          <Text color={gray}>· 1박 ·</Text>
          <HStack spacing={0.5}>
            <FaStar size={11} />
            <Text>{typeof rating === "number" ? rating : "신규"}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Link>
  );
}
