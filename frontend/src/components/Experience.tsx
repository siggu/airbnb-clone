import {
  VStack,
  HStack,
  Box,
  Image,
  Text,
  useColorModeValue,
  Button,
  Skeleton,
} from "@chakra-ui/react";
import { FaCamera, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

interface IExperienceProps {
  pk: number;
  name: string;
  city: string;
  country: string;
  price: number;
  start: string;
  end: string;
  rating?: number | null;
  imageUrl?: string;
  isOwner?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  isPriority?: boolean;
}

export default function Experience({
  pk,
  name,
  city,
  country,
  price,
  start,
  end,
  rating,
  imageUrl,
  isOwner,
  isWishlisted,
  onToggleWishlist,
  isPriority = false,
}: IExperienceProps) {
  const gray = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();

  const onCameraClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/experiences/${pk}/photos`);
  };

  const onHeartClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
            <Image
              objectFit={"cover"}
              w={"100%"}
              h={"250px"}
              src={imageUrl}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
              fallback={<Skeleton h={"250px"} w={"100%"} />}
            />
          ) : (
            <Box h={"250px"} w={"100%"} bg={"gray.200"} _dark={{ bg: "gray.600" }} />
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
              <FaCamera size={"20px"} />
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
              <Box position={"relative"} display={"flex"}>
                <FaHeart size={"20px"} color={isWishlisted ? "rgba(66,153,225,0.85)" : "rgba(0,0,0,0.5)"} />
                <Box position={"absolute"} top={0} left={0}>
                  <FaRegHeart size={"20px"} color={"white"} />
                </Box>
              </Box>
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
        <HStack spacing={1} fontSize={"sm"} flexWrap="wrap">
          <Text as={"b"}>₩{price.toLocaleString()}</Text>
          <Text color={gray}>· 1인 ·</Text>
          <Text color={gray}>{start} ~ {end} ·</Text>
          <HStack spacing={0.5}>
            <FaStar size={11} color='#4299E1' />
            <Text>{typeof rating === "number" ? rating : 0}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Link>
  );
}
