import {
  Box,
  Flex,
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

  // 슬라이딩 탭 pill (JSX 변수 — 컴포넌트 아님)
  const tabPill = (
    <Box
      position="relative"
      display="inline-flex"
      isolation="isolate"
      border="1px"
      borderColor="gray.200"
      _dark={{ borderColor: "gray.700" }}
      p="1"
      borderRadius="full"
      flexShrink={0}
    >
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
          py={2}
          px={6}
          fontSize="sm"
          borderRadius="full"
          fontWeight="semibold"
          whiteSpace="nowrap"
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
          py={2}
          px={6}
          fontSize="sm"
          borderRadius="full"
          fontWeight="semibold"
          whiteSpace="nowrap"
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
  );

  return (
    <Box borderBottomWidth={1}>
      {/* 메인 행 */}
      <Flex
        alignItems="center"
        py={4}
        px={{ base: 4, sm: 8, lg: 20 }}
      >
        {/* 로고 */}
        <Box flexShrink={0}>
          <Link to={"/"}>
            <img
              src="/favicon.ico"
              style={{ height: "48px", width: "auto", filter: logoFilter }}
              alt="StayAI"
            />
          </Link>
        </Box>

        {/* 탭 — md 이상에서 flex=1로 남은 공간을 채우고 중앙 정렬 */}
        <Box
          flex={1}
          display={{ base: "none", md: "flex" }}
          justifyContent="center"
        >
          {tabPill}
        </Box>

        {/* 컨트롤 — 모바일에서 ml="auto"로 오른쪽 끝 고정 */}
        <Box flexShrink={0} ml={{ base: "auto", md: 0 }}>
          {!userLoading ? (
            !isLoggedIn ? (
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
        </Box>
      </Flex>

      {/* 모바일 탭 행 — md 미만에서만 표시 */}
      <Flex
        display={{ base: "flex", md: "none" }}
        justifyContent="center"
        pb={3}
      >
        {tabPill}
      </Flex>

      <LoginModal isOpen={isLoginOpen} onClose={onLoginCLose} />
      <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
    </Box>
  );
}
