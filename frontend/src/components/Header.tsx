import {
  Box,
  Grid,
  HStack,
  Button,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  ToastId,
} from "@chakra-ui/react";
import { FaMoon, FaSun, FaBars, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import useUser from "../lib/useUser";
import { logOut } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function Header() {
  const { userLoading, isLoggedIn, user } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
  const isExperiencesTab = pathname === "/experiences" || pathname.startsWith("/experiences/");
  const { toggleColorMode, colorMode } = useColorMode();
  const colorModeIcon = colorMode === "light" ? <FaMoon /> : <FaSun />;
  const colorModeLabel = colorMode === "light" ? "다크 모드" : "라이트 모드";
  const logoFilter = useColorModeValue("none", "invert(1)");
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
      navigate("/");
    },
  });
  const onLogOut = async () => {
    mutation.mutate();
  };

  return (
    <Grid
      templateColumns="1fr auto 1fr"
      alignItems="center"
      py={4}
      px={{ base: 4, sm: 8, lg: 20 }}
      borderBottomWidth={1}
    >
      {/* 왼쪽: 로고 */}
      <Link to={"/"}>
        <img
          src="/favicon.ico"
          style={{ height: "60px", width: "auto", filter: logoFilter }}
          alt="StayAI"
        />
      </Link>

      {/* 가운데: 탭 (슬라이더 전환) */}
      <Box
        position="relative"
        display="inline-flex"
        border="1px"
        borderColor="gray.200"
        _dark={{ borderColor: "gray.700" }}
        p="1"
        borderRadius="full"
      >
        {/* 슬라이딩 배경 */}
        <Box
          position="absolute"
          top="4px"
          bottom="4px"
          left="4px"
          width="calc(50% - 4px)"
          bg="blue.800"
          _dark={{ bg: "white" }}
          borderRadius="full"
          transform={!isExperiencesTab ? "translateX(0)" : "translateX(100%)"}
          transition="transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          zIndex={0}
          pointerEvents="none"
        />
        <Link to={"/"}>
          <Button
            variant="unstyled"
            py={{ base: 1, sm: 2 }}
            px={{ base: 3, sm: 6 }}
            fontSize={{ base: "sm" }}
            borderRadius="full"
            fontWeight="semibold"
            color={!isExperiencesTab ? "white" : "blue.800"}
            _dark={{ color: !isExperiencesTab ? "blue.800" : "white" }}
            transition="color 0.25s ease"
            position="relative"
            zIndex={1}
          >
            숙소
          </Button>
        </Link>
        <Link to={"/experiences"}>
          <Button
            variant="unstyled"
            py={{ base: 1, sm: 2 }}
            px={{ base: 3, sm: 6 }}
            fontSize={{ base: "sm", sm: "md" }}
            borderRadius="full"
            fontWeight="semibold"
            color={isExperiencesTab ? "white" : "blue.800"}
            _dark={{ color: isExperiencesTab ? "blue.800" : "white" }}
            transition="color 0.25s ease"
            position="relative"
            zIndex={1}
          >
            체험
          </Button>
        </Link>
      </Box>

      {/* 오른쪽: 컨트롤 (오른쪽 정렬) */}
      <HStack justify="flex-end">
        {!userLoading ? (
          !isLoggedIn ? (
            /* 비로그인: 햄버거 메뉴 */
            <Menu>
              <MenuButton
                as={Button}
                variant="outline"
                borderRadius="full"
                px={3}
                py={2}
                size="sm"
              >
                <FaBars />
              </MenuButton>
              <MenuList>
                <MenuItem icon={colorModeIcon} onClick={toggleColorMode}>
                  {colorModeLabel}
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaSignInAlt />} onClick={onLoginOpen}>로그인</MenuItem>
                <MenuItem icon={<FaUserPlus />} onClick={onSignUpOpen}>회원가입</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            /* 로그인: 아바타 + 햄버거 pill 버튼 */
            <Menu>
              <MenuButton
                as={Button}
                variant="outline"
                borderRadius="full"
                px={2}
                py={1}
                h="auto"
              >
                <HStack spacing={2}>
                  <FaBars />
                  <Avatar
                    name={user?.name}
                    src={user?.avatar}
                    size="sm"
                  />
                </HStack>
              </MenuButton>
              <MenuList>
                <Link to={`/users/${user?.username}`}>
                  <MenuItem icon={<FaUser />}>내 프로필</MenuItem>
                </Link>
                <MenuItem icon={colorModeIcon} onClick={toggleColorMode}>
                  {colorModeLabel}
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaSignOutAlt />} onClick={onLogOut}>로그아웃</MenuItem>
              </MenuList>
            </Menu>
          )
        ) : null}
      </HStack>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginCLose} />
      <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
    </Grid>
  );
}
