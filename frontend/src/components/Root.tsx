import { Box } from "@chakra-ui/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./Header";
import ChatbotWidget from "./ChatbotWidget";

export default function Root() {
  return (
    <Box>
      <Header />
      <Outlet />
      <ScrollRestoration />
      <ReactQueryDevtools />
      <ChatbotWidget />
    </Box>
  );
}
