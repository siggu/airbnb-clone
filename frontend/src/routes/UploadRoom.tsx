import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import useHostOnlyPage from "../components/HostOnlyPage";
import ProtectedPage from "../components/ProtectedPage";
import { FaBed, FaDollarSign, FaToilet } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getAmenities, getCategories } from "../api";
import { IAmenity, ICategory } from "../types";

export default function UploadRoom() {
  const { data: amenities, isLoading: isAmenitiesLoading } = useQuery<
    IAmenity[]
  >({
    queryKey: ["amenities"],
    queryFn: getAmenities,
  });
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<
    ICategory[]
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  useHostOnlyPage();
  return (
    <ProtectedPage>
      <Box
        pb={40}
        mt={10}
        px={{
          base: 10,
          lg: 40,
        }}
      >
        <Container>
          <Heading textAlign={"center"}>Upload Room</Heading>
          <VStack spacing={10} as={"form"} mt={5}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input required type="text" />
              <FormHelperText>Wirte the name of your room</FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Country</FormLabel>
              <Input required type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>City</FormLabel>
              <Input required type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Input required type="text" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Price</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaDollarSign />} />
                <Input type="number" min={0} />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Rooms</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaBed />} />
                <Input type="number" min={0} />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Toilets</FormLabel>
              <InputGroup>
                <InputLeftAddon children={<FaToilet />} />
                <Input type="number" min={0} />
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea />
            </FormControl>
            <FormControl isRequired>
              <Checkbox>Pet friendly?</Checkbox>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Kind of room</FormLabel>
              <RadioGroup>
                <HStack spacing="24px">
                  <Radio value={"entire_place"}>Entire Place</Radio>
                  <Radio value={"private_room"}>Private Room</Radio>
                  <Radio value={"shared_room"}>Shared Room</Radio>
                </HStack>
              </RadioGroup>
              <FormHelperText>
                What kind of room are you renting?
              </FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select placeholder="Choose a kind">
                {categories?.map((cateogry) => (
                  <option key={cateogry.pk} value={cateogry.pk}>
                    {cateogry.name}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                What category describes your room?
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Amenities</FormLabel>
              <Grid templateColumns={"1fr 1fr"} gap={5}>
                {amenities?.map((amenity) => (
                  <Box key={amenity.pk}>
                    <Checkbox>{amenity.name}</Checkbox>
                    <FormHelperText>{amenity.description}</FormHelperText>
                  </Box>
                ))}
              </Grid>
            </FormControl>
            <Button colorScheme={"red"} size={"lg"} w={"100%"}>
              Upload Room
            </Button>
          </VStack>
        </Container>
      </Box>
    </ProtectedPage>
  );
}
