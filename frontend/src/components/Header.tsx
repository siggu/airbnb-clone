import {
  HStack,
  IconButton,
  Button,
  Box,
  useDisclosure,
  useColorMode,
  LightMode,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  ToastId,
} from "@chakra-ui/react";
import { FaAirbnb, FaMoon, FaSun } from "react-icons/fa";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import useUser from "../lib/useUser";
import { logOut } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useRef } from "react";

export default function Header() {
  const { userLoading, isLoggedIn, user } = useUser();
  const {
    isOpen: isLoginOpen,
    onClose: onLoginCLose,
    onOpen: onLoginOpen,
  } = useDisclosure();
  const {
    isOpen: isSignUpOpen,
    onClose: onSignUpClose,
    onOpen: onSignUpOpen,
  } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const logoColor = useColorModeValue("red.500", "red.200");
  const Icon = useColorModeValue(FaMoon, FaSun);
  const toast = useToast();
  const queryClient = useQueryClient();
  const toastId = useRef<ToastId>();
  const mutation = useMutation({
    mutationFn: logOut,
    onMutate: () => {
      toastId.current = toast({
        title: "Login out...",
        description: "Sad to see you go...",
        status: "loading",
        position: "bottom-right",
      });
    },
    onSuccess() {
      if (toastId.current) {
        queryClient.refetchQueries({
          queryKey: ["me"],
          exact: true,
        });
        toast.update(toastId.current, {
          status: "success",
          title: "Done!",
          description: "See you later!",
        });
      }
    },
  });
  const onLogOut = async () => {
    mutation.mutate();
  };
  return (
    <HStack
      justifyContent={"space-between"}
      alignItems={"center"}
      py={4}
      px={{ base: 4, sm: 8, lg: 20 }}
      borderBottomWidth={1}
    >
      <Link to={"/"}>
        <Box color={logoColor}>
          <FaAirbnb size={"48px"} />
        </Box>
      </Link>
      <HStack spacing={{ base: 1, md: 2 }}>
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label={"Toggle dark mode"}
          icon={<Icon />}
        />
        {!userLoading ? (
          !isLoggedIn ? (
            <>
              <Button onClick={onLoginOpen} size={{ base: "sm", md: "md" }}>
                Log in
              </Button>
              <LightMode>
                <Button
                  onClick={onSignUpOpen}
                  colorScheme="red"
                  size={{ base: "sm", md: "md" }}
                >
                  Sign up
                </Button>
              </LightMode>
            </>
          ) : (
            <Menu>
              <MenuButton>
                <Avatar
                  name={user?.name}
                  src={user?.avatar}
                  size={{ base: "sm", md: "md" }}
                />
              </MenuButton>
              <MenuList>
                {user?.is_host ? (
                  <Link to={"/rooms/upload"}>
                    <MenuItem>Upload room</MenuItem>
                  </Link>
                ) : null}
                <MenuItem onClick={onLogOut}>Log out</MenuItem>
              </MenuList>
            </Menu>
          )
        ) : null}
      </HStack>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginCLose} />
      <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
    </HStack>
  );
}
