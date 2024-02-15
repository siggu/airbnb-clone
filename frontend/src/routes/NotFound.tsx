import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <VStack bg="gray.100" justifyContent={"center"} minH="100vh">
      <Helmet>Not Found</Helmet>
      <Heading>Page not found</Heading>
      <Text>It seems that you're lost.</Text>
      <Link to="/">
        <Button colorScheme="red" variant={"link"}>
          Go home →
        </Button>
      </Link>
    </VStack>
  );
}
