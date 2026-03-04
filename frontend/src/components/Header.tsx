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
import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";

export default function Header() {
  const { userLoading, isLoggedIn, user } = useUser();
  const { pathname } = useLocation();
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
        title: "로그아웃 중...",
        description: "다음에 또 만나요...",
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
          title: "완료!",
          description: "다음에 또 봬요!",
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
      <HStack spacing={1}>
        <Link to={"/"}>
          <Button
            variant={"ghost"}
            fontWeight={pathname === "/" ? "bold" : "normal"}
            color={pathname === "/" ? "red.500" : "gray.500"}
            borderBottomWidth={pathname === "/" ? 2 : 0}
            borderBottomColor={"red.500"}
            borderRadius={0}
          >
            숙소
          </Button>
        </Link>
        <Link to={"/experiences"}>
          <Button
            variant={"ghost"}
            fontWeight={pathname === "/experiences" ? "bold" : "normal"}
            color={pathname === "/experiences" ? "red.500" : "gray.500"}
            borderBottomWidth={pathname === "/experiences" ? 2 : 0}
            borderBottomColor={"red.500"}
            borderRadius={0}
          >
            체험
          </Button>
        </Link>
      </HStack>
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
                로그인
              </Button>
              <LightMode>
                <Button
                  onClick={onSignUpOpen}
                  colorScheme="red"
                  size={{ base: "sm", md: "md" }}
                >
                  회원가입
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
                    <MenuItem>숙소 등록</MenuItem>
                  </Link>
                ) : null}
                <MenuItem onClick={onLogOut}>로그아웃</MenuItem>
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
