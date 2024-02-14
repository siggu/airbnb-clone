import {
  VStack,
  Grid,
  HStack,
  Box,
  Image,
  Text,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { FaCamera, FaRegHeart, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

interface IRoomProps {
  imageUrl: string;
  name: string;
  rating: number;
  city: string;
  country: string;
  price: number;
  pk: number;
  isOwner: boolean;
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
}: IRoomProps) {
  const gray = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();
  const onCameraClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(`/rooms/${pk}/photos`);
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
            <Box minH={"280px"} h={"100%"} w={"100%"} p={10} bg={"green.400"} />
          )}
          <Button
            variant={"unstyled"}
            position={"absolute"}
            top={0}
            right={0}
            onClick={onCameraClick}
            color={"white"}
          >
            {isOwner ? (
              <FaCamera size={"20px"} />
            ) : (
              <FaRegHeart size={"20px"} />
            )}
          </Button>
        </Box>
        <Box>
          <Grid gap={2} templateColumns={"20fr 1fr"}>
            <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
              {name}
            </Text>
            <HStack alignItems={"center"} spacing={1}>
              <FaStar size={12} />
              <Text fontSize={"sm"}>{rating}</Text>
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
    </Link>
  );
}
