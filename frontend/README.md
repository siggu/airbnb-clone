1. [FRONT-END SETUP](#front-end-setup)
   <br>
   1.1 [Introduction](#introduction)
   <br>
   1.2 [Requirements](#requirements)
   <br>
   1.3 [Setup](#setup)
   <br>
   1.4 [Not Found Page](#not-found-page)
   <br>
   1.5 [Chakra Tour](#chakra-tour)
   <br>
2. [CHAKRA UI](#chakra-ui)
   <br>
   2.1 [Header](#header)
   <br>
   2.2 [Log In Modal](#log-in-modal)
   <br>
   2.3 [Sign Up Modal](#sign-up-modal)
   <br>
   2.4 [Dark Mode](#dark-mode)
   <br>
   2.5 [Rooms Grid](#rooms-grid)
   <br>
   2.6 [Responsive Design](#responsive-design)
   <br>
   2.7 [Skeletons](#skeletons)
   <br>
3. [REACT QUERY](#react-query)
   <br>
   3.1 [Manual Fetching](#manual-fetching)
   <br>
   3.2 [React Query](#react-query-1)
   <br>
   3.3 [Axios](#axios)
   <br>
   3.4 [Room Detail](#room-detail-1)
   <br>
   3.5 [Devtools and Query Keys](#devtools-and-query-keys)
   <br>
   3.6 [Photos Grid](#photos-grid)
   <br>
   3.7 [Reviews](#reviews-2)
   <br>
   3.8 [Conclusions](#conclusions)
   <br>
4. [AUTHENTICATION](#authentication)
   <br>
   4.1 [UseUser](#useuser)
   <br>
   4.1 [Credentials](#credentials)
   <br>
   4.2 [Log Out](#log-out)
   <br>
   4.3 [CSRF](#csrf)
   <br>
   4.4 [Github Log In](#github-log-in)
   <br>
   4.5 [Github Code](#github-code)
   <br>
   4.6 [Access Token](#access-token)
   <br>
   4.7 [Emails](#emails)
   <br>
   4.8 [Kakao Talk App](#kakao-talk-app)
   <br>
   4.9 [Kakao Talk Auth](#kakao-talk-auth)
   <br>
   4.10 [Kakao Log In](#kakao-log-in)
   <br>
   4.11 [Log In Form](#log-in-form)
   <br>
   4.12 [React Hook Form](#react-hook-form)
   <br>
   4.13 [useMutation](#usemutation)
   <br>
   4.14 [Recap](#recap)
   <br>
   4.15 [Code Challenge](#code-challenge)
   <br>
5. [UPLOAD ROOM](#upload-room)
   <br>
   5.1 [Protected Pages](#protected-pages)
   <br>
   5.2 [Upload Form](#upload-form)
   <br>
   5.3 [Dynamic Form](#dynamic-form)

<br>

## FRONT-END SETUP

### Introduction

- 프론트엔드에서 사용할 기술들
  - `create-react-app`
  - `TypeScript`
  - `TanStack Query`
  - `Chakra UI`

<br>

### Requirements

- 리액트JS, 타입스크립트, 노드JS 준비

  ```
  node -v
  v18.18.0
  ```

<br>

### Setup

- 프로젝트를 저장하고 싶은 위치로 이동해서 아래 코드를 작성한다.

  > `C:\Users\82102\Documents\GitHub\airbnb-clone`

  - `npx create-react-app frontend --template=typescript`

- `frontend` 폴더에 가서 정리를 한다.

  - `src/App.tsx`, `src/index.tsx`, `src/react-app-env.d.ts`를 제외하고 모두 삭제

  - `src/index.tsx`

    ```tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import App from "./App";

    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement
    );
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    ```

  - `src/App.tsx`

    ```tsx
    import React from "react";

    function App() {
      return <div />;
    }

    export default App;
    ```

- `chakraUI`와 `react-router-dom`을 설치한다.

  > `frontend`에서 진행

  - `chakraUI`

    - `npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion`

  - `react-router-dom`
    - `npm i react-router-dom`

- `index.tsx`에서 `App`을 `ChakraProvider`로 감싸준다.

  - `src/index.tsx`

    ```tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import App from "./App";
    import { ChakraProvider } from "@chakra-ui/react";

    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement
    );
    root.render(
      <React.StrictMode>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </React.StrictMode>
    );
    ```

    - `Provider`를 사용하는 이유는 `chakra`에 특정 설정을 할 수 있기 때문이다.
      - 커스텀할 수 있는 테마와 구성을 모든 컴포넌트에 전달하는 가장 좋은 방식이 `Provider`를 생성하는 것이다.

<details>
<summary>리액트 관련 vscode Extensions</summary>
<markdown="1">
<div>

- Auto Import - ES6, TS, JSX, TSX

- Reactjs code snippets

- ESLint

</div>
</details>

<br>

### Router Setup

- `react-router-dom`을 사용해 라우터 설정을 해보자.

  - 브라우저 탐색 표시줄에 나타날 `URL`을 `react-router`에게 설명하는 작업을 해보자.
    > 해당 `URL`에 위치할 때 유저에게 보여줄 컴포넌트를 선택해야 한다.

<details>
<summary>react-router-dom 버전 6.4  동작방식</summary>
<markdown="1">
<div>

- `react-router-dom` 버전 5의 동작방식은 `user`가 브라우저에 작성한 `URL`을 보는 것이다.

  - 그 다음, `router`로 이동해 해당 `URL`의 `router`가 있는지 확인하고 보여주고 싶은 컴포넌트를 보여줬었다.

- 6.4 버전에서는 좀 다르다.

  - `user`가 어플리케이션의 `root`(`/`)로 이동한다면 `Home`을 보여줄 것이고, `/rooms`로 이동한다면 `Rooms`를 보여줄 것이다.

    ```
    / -> Home
    /rooms -> Rooms
    ```

    - `/rooms` `URL`은 `/` `URL`의 자식과 같다.

      - 따라서 `root` 컴포넌트를 만들 것이다.

  - `root` 컴포넌트는 모든 화면의 부모가 된다.

    - `root` 컴포넌트에는 다른 모든 화면과 공유할 화면 `element`를 가진다.
      - 예를 들어 `root` 컴포넌트에는 `Header`와 `Footer`를 두고, 중간에 `Rooms`, `Users` 컴포넌트 등을 둘 수 있다.

  - `root` 컴포넌트를 항상 렌더링 하는데
    - 페이지가 `/rooms`, `/users`, `/login`인지에 따라 `root` 컴포넌트가 중간에 어떤 것을 렌더링하는지가 변한다.

</div>
</details>

- `src/router.tsx`

  ```tsx
  import { createBrowserRouter } from "react-router-dom";
  import Root from "./components/Root";
  import Home from "./routes/Home";
  import Users from "./routes/Users";

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "users",
          element: <Users />,
        },
      ],
    },
  ]);

  export default router;
  ```

  - router.tsx에서 누군가 `'/'` 경로 혹은 그 자식 중 하나로 이동할 때

    - `Root`라는 요소를 렌더링할 것이다.

  - `Root element`의 `children`을 지정해준다.

    - `/`로 이동하면 `Home`을 렌더링 해준다.

    - `/users`로 이동하면 `User`를 렌더링 해준다.

  - 하지만 위의 `url`로 이동해도 여전히 `Root`만 렌더링된다.

    - `Root`와 `Home`, `User` 컴포넌트가 모두 렌더링 되기 위해서 아래와 같이 작성한다.

      - `components/Root.tsx`

        ```tsx
        import { Outlet } from "react-router-dom";

        export default function Root() {
          return (
            <h1>
              i'm root
              <Outlet />
            </h1>
          );
        }
        ```

        - `Outlet`이 하는 일은 `Root`의 중앙에 렌더링 하고 싶은 컴포넌트를 위치시키는 것이다.
          > 현재의 `URL`과 일치시키는 `children`을 렌더링 해줌

- `App.tsx`를 삭제하고 `index.tsx`에서 `App`을 렌더링하는 대신 `RouterProvider`를 렌더링한다.

  - `src/index.tsx`

    ```tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import { ChakraProvider } from "@chakra-ui/react";
    import { RouterProvider } from "react-router-dom";
    import router from "./router";

    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement
    );
    root.render(
      <React.StrictMode>
        <ChakraProvider>
          <RouterProvider router={router} />
        </ChakraProvider>
      </React.StrictMode>
    );
    ```

<br>

### Not Found Page

- `Not Found` 페이지를 만들어보자.

  - `routes/NotFound.tsx`

    ```tsx
    import { Button, Heading, Text, VStack } from "@chakra-ui/react";
    import { Link } from "react-router-dom";

    export default function NotFound() {
      return (
        <VStack bg="gray.100" justifyContent={"center"} minH="100vh">
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
    ```

    - `NotFound` 페이지를 간단하게 만들 수 있다.

      ![Alt text](./images/NotFound.png)

<br>

### Chakra Tour

- `Chakra UI`와 컴포넌트들을 공식문서에서 찾아볼 수 있다.

  - [chakra-ui.com/docs](https://chakra-ui.com/docs/components)

<details>
<summary>Chakra UI with React Native</summary>
<markdown="1">
<div>

- [https://github.com/akveo/react-native-ui-kitten](https://github.com/akveo/react-native-ui-kitten)

- [https://tamagui.dev/](https://tamagui.dev/)

</div>
</details>

---

## CHAKRA UI

### Header

- `Chakra UI`로 `Header`를 만들어보자.

  - [react-icons](https://react-icons.github.io/react-icons/)

    - `react-icons`를 사용하기 위해서 `react-icons`를 설치한다.

      ```
      npm install react-icons --save
      ```

- `components/Root.tsx`

  ```tsx
  import { Box, Button, HStack } from "@chakra-ui/react";
  import { Outlet } from "react-router-dom";
  import { FaAirbnb } from "react-icons/fa";

  export default function Root() {
    return (
      <Box>
        <HStack
          justifyContent={"space-between"}
          py={5}
          px={10}
          borderBottomWidth={1} # bottom border
        >
          <Box color={"red.500"}>
            <FaAirbnb size={"48px"} />
          </Box>
          <HStack spacing={"2"}>
            <Button>Log in</Button>
            <Button colorScheme="red">Sign up</Button>
          </HStack>
        </HStack>
        <Outlet />
      </Box>
    );
  }
  ```

<br>

### Log In Modal

- `Log in` `modal`을 만들어보자.

  - `components/Root.tsx`

    ```tsx
    import {
      Box,
      Button,
      HStack,
      IconButton,
      Input,
      InputGroup,
      InputLeftElement,
      Modal,
      ModalBody,
      ModalCloseButton,
      ModalContent,
      ModalHeader,
      ModalOverlay,
      VStack,
      useDisclosure,
    } from "@chakra-ui/react";
    import { Outlet } from "react-router-dom";
    import { FaAirbnb, FaMoon, FaUserNinja, FaLock } from "react-icons/fa";

    export default function Root() {
      const { isOpen, onClose, onOpen } = useDisclosure();
      return (
        <Box>
          <HStack
            justifyContent={"space-between"}
            py={5}
            px={10}
            borderBottomWidth={1}
          >
            <Box color={"red.500"}>
              <FaAirbnb size={"48px"} />
            </Box>
            <HStack spacing={"2"}>
              <IconButton
                variant="ghost"
                aria-label={"Toggle dark mode"}
                icon={<FaMoon />}
              />
              <Button onClick={onOpen}>Log in</Button>
              <Button colorScheme="red">Sign up</Button>
            </HStack>
            <Modal onClose={onClose} isOpen={isOpen}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Log in</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack>
                    <InputGroup>
                      <InputLeftElement
                        children={
                          <Box color={"gray.500"}>
                            <FaUserNinja />
                          </Box>
                        }
                      />
                      <Input variant={"filled"} placeholder="username" />
                    </InputGroup>
                    <InputGroup>
                      <InputLeftElement
                        children={
                          <Box color={"gray.500"}>
                            <FaLock />
                          </Box>
                        }
                      />
                      <Input variant={"filled"} placeholder="password" />
                    </InputGroup>
                  </VStack>
                  <Button mt={"4"} colorScheme="red" w="100%">
                    Log in
                  </Button>
                </ModalBody>
              </ModalContent>
            </Modal>
          </HStack>
          <Outlet />
        </Box>
      );
    }
    ```

<br>

### Sign Up Modal

- `root` 컴포넌트를 리팩토링 해보자.

  - `Header`, `Log In Modal` 등의 컴포넌트를 따로 만들어야 한다.

- `components/Root.tsx`

  ```tsx
  import { Box } from "@chakra-ui/react";
  import { Outlet } from "react-router-dom";
  import Header from "./Header";

  export default function Root() {
    return (
      <Box>
        <Header />
        <Outlet />
      </Box>
    );
  }
  ```

- `components/SocialLogin.tsx`

  ```tsx
  import { HStack, Divider, VStack, Button, Box, Text } from "@chakra-ui/react";
  import { FaGithub, FaComment } from "react-icons/fa";

  export default function SocialLogin() {
    return (
      <Box mb="4">
        <HStack my={8}>
          <Divider />
          <Text textTransform={"uppercase"} color="gray" fontSize={"xs"} as="b">
            Or
          </Text>
          <Divider />
        </HStack>
        <VStack>
          <Button w="100%" leftIcon={<FaGithub />} colorScheme="telegram">
            Continue with Github
          </Button>
          <Button w="100%" leftIcon={<FaComment />} colorScheme="yellow">
            Continue with Kakao
          </Button>
        </VStack>
      </Box>
    );
  }
  ```

- `components/LoginModal.tsx`

  ```tsx
  import {
    Box,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    VStack,
  } from "@chakra-ui/react";
  import { FaUserNinja, FaLock } from "react-icons/fa";
  import SocialLogin from "./SocialLogin";

  interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    return (
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log in</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <InputGroup>
                <InputLeftElement
                  children={
                    <Box color={"gray.500"}>
                      <FaUserNinja />
                    </Box>
                  }
                />
                <Input variant={"filled"} placeholder="username" />
              </InputGroup>
              <InputGroup>
                <InputLeftElement
                  children={
                    <Box color={"gray.500"}>
                      <FaLock />
                    </Box>
                  }
                />
                <Input variant={"filled"} placeholder="password" />
              </InputGroup>
            </VStack>
            <Button mt={"4"} colorScheme="red" w="100%">
              Log in
            </Button>
            <SocialLogin />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  ```

- `components/Header.tsx`

  ```tsx
  import {
    HStack,
    IconButton,
    Button,
    Box,
    useDisclosure,
  } from "@chakra-ui/react";
  import { FaAirbnb, FaMoon } from "react-icons/fa";
  import LoginModal from "./LoginModal";

  export default function Header() {
    const { isOpen, onClose, onOpen } = useDisclosure();
    return (
      <HStack
        justifyContent={"space-between"}
        py={5}
        px={10}
        borderBottomWidth={1}
      >
        <Box color={"red.500"}>
          <FaAirbnb size={"48px"} />
        </Box>
        <HStack spacing={"2"}>
          <IconButton
            variant="ghost"
            aria-label={"Toggle dark mode"}
            icon={<FaMoon />}
          />
          <Button onClick={onOpen}>Log in</Button>
          <Button colorScheme="red">Sign up</Button>
        </HStack>
        <LoginModal isOpen={isOpen} onClose={onClose} />
      </HStack>
    );
  }
  ```

- `Sign Up Modal`을 만들어보자.

  - `LoginModal`과 거의 똑같기 때문에 복사하고 `name`과 `username`을 추가하면 된다.

    - `components/SignUpModal.tsx`

      ```tsx
      import {
        Box,
        Button,
        Input,
        InputGroup,
        InputLeftElement,
        Modal,
        ModalBody,
        ModalCloseButton,
        ModalContent,
        ModalHeader,
        ModalOverlay,
        VStack,
      } from "@chakra-ui/react";
      import {
        FaUserNinja,
        FaLock,
        FaEnvelope,
        FaUserSecret,
      } from "react-icons/fa";
      import SocialLogin from "./SocialLogin";

      interface SignUpModalProps {
        isOpen: boolean;
        onClose: () => void;
      }

      export default function SignUpModal({
        isOpen,
        onClose,
      }: SignUpModalProps) {
        return (
          <Modal onClose={onClose} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Sign up</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack>
                  <InputGroup>
                    <InputLeftElement
                      children={
                        <Box color={"gray.500"}>
                          <FaUserSecret />
                        </Box>
                      }
                    />
                    <Input variant={"filled"} placeholder="name" />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement
                      children={
                        <Box color={"gray.500"}>
                          <FaEnvelope />
                        </Box>
                      }
                    />
                    <Input variant={"filled"} placeholder="email" />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement
                      children={
                        <Box color={"gray.500"}>
                          <FaUserNinja />
                        </Box>
                      }
                    />
                    <Input variant={"filled"} placeholder="username" />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement
                      children={
                        <Box color={"gray.500"}>
                          <FaLock />
                        </Box>
                      }
                    />
                    <Input variant={"filled"} placeholder="password" />
                  </InputGroup>
                </VStack>
                <Button mt={"4"} colorScheme="red" w="100%">
                  Log in
                </Button>
                <SocialLogin />
              </ModalBody>
            </ModalContent>
          </Modal>
        );
      }
      ```

<br>

### Dark Mode

- 다크모드 기능을 추가해보자.

  - `src`에 `theme.ts` 파일을 만들어서 기본 테마(`initialColorMode`)와 유저의 테마를 따라갈 것인지(`useSystemColorMode`) 정한다.

    - `src/theme.ts`

      ```ts
      import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

      const config: ThemeConfig = {
        initialColorMode: "light",
        useSystemColorMode: false,
      };

      const theme = extendTheme({ config });

      export default theme;
      ```

- `index.tsx`의 `ChakraProvider`에게 `theme`을 줄 수 있다.

  - `index.tsx`

    ```tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
    import { RouterProvider } from "react-router-dom";
    import router from "./router";
    import theme from "./theme";

    const root = ReactDOM.createRoot(
      document.getElementById("root") as HTMLElement
    );
    root.render(
      <React.StrictMode>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <RouterProvider router={router} />
        </ChakraProvider>
      </React.StrictMode>
    );
    ```

    - `ColorModeScript`로 어플리케이션을 다시 로드했을 때 사용자가 선택했던 테마를 불러올 수 있다.

- `components/Header.tsx`

  ```tsx
  import {
    HStack,
    IconButton,
    Button,
    Box,
    useDisclosure,
    useColorMode,
    LightMode,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { FaAirbnb, FaMoon, FaSun } from "react-icons/fa";
  import LoginModal from "./LoginModal";
  import SignUpModal from "./SignUpModal";

  export default function Header() {
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
    return (
      <HStack
        justifyContent={"space-between"}
        py={5}
        px={10}
        borderBottomWidth={1}
      >
        <Box color={logoColor}>
          <FaAirbnb size={"48px"} />
        </Box>
        <HStack spacing={"2"}>
          <IconButton
            onClick={toggleColorMode}
            variant="ghost"
            aria-label={"Toggle dark mode"}
            icon={<Icon />}
          />
          <Button onClick={onLoginOpen}>Log in</Button>
          <LightMode>
            <Button onClick={onSignUpOpen} colorScheme="red">
              Sign up
            </Button>
          </LightMode>
        </HStack>
        <LoginModal isOpen={isLoginOpen} onClose={onLoginCLose} />
        <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
      </HStack>
    );
  }
  ```

  - `onClick`에 3항 연산자를 사용해 아래와 같이다크 모드, 라이트 모드 아이콘을 설정할 수 있다.

    ```tsx
    <Button onClick={colorMode === "light" ? <FaMoon /> : <FaSun />}>
    ```

    - 하지만 너무 길기 때문에 `useColorModeValue`을 사용할 수 있다.

      ```tsx
      - 선언
        const Icon = useColorModeValue(FaMoon, FaSun);

      - 사용
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label={"Toggle dark mode"}
          icon={<Icon />}
        />
      ```

      > `const Icon = useColorModeValue(FaMoon, FaSun);`와 같이 컴포넌트를 저장할 때에는 반드시 대문자로 시작해야 한다.

  - `<LightMode></LightMode>`로 감싸면 항상 `LightMode`가 된다.

<br>

### Rooms Grid

- `rooms` 반응형 그리드를 만들어보자.

  - `routes/Home.tsx`

    ```tsx
    import {
      Box,
      Grid,
      HStack,
      Heading,
      Image,
      Text,
      VStack,
    } from "@chakra-ui/react";
    import { FaStar } from "react-icons/fa";

    export default function home() {
      return (
        <Grid
          mt={"10"}
          px={"20"}
          columnGap={"4"}
          rowGap={"8"}
          templateColumns={"repeat(5, 1fr)"}
        >
          <VStack spacing={1} alignItems={"flex-start"}>
            <Box overflow={"hidden"} mb={2} rounded={"3xl"}>
              <Image
                h={"250"}
                src="https://a0.muscache.com/im/pictures/miso/
                Hosting-706856413814921022/original/
                0f516c0a-18fc-4d49-b997-112bd1ea2a41.jpeg?im_w=720"
              />
            </Box>
            <Box>
              <Grid gap={2} templateColumns={"5fr 1fr"}>
                <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
                  한국 Oedong-eup, Gyeongju
                </Text>
                <HStack spacing={1}>
                  <FaStar size={15} />
                  <Text>5.0</Text>
                </HStack>
              </Grid>
              <Text fontSize={"sm"} color={"gray.600"}>
                288km 거리
              </Text>
            </Box>
            <Text fontSize={"sm"} color={"gray.600"}>
              <Text as={"b"}>₩593,412 </Text>/박
            </Text>
          </VStack>
        </Grid>
      );
    }
    ```

    - `<Grid templateColumns={"repeat(5, 1fr)"}` />

      - 5개의 `column`을 똑같은 비율로 가지겠다는 뜻

    - `<Box overflow={"hidden"} rounded={"3xl"}`
      - `border-radius`와 같지만 디자인을 더 일관적으로 유지할 수 있도록 값을 정할 수 있다.

<br>

### Responsive Design

- 하트를 추가하고 반응형 디자인을 해보자.

  - `routes/Home.tsx`

    ```tsx
    import { Grid } from "@chakra-ui/react";
    import Room from "../components/Room";

    export default function home() {
      return (
        <Grid
          mt={"10"}
          px={{
            sm: 10,
            lg: 20,
          }}
          columnGap={"4"}
          rowGap={"8"}
          templateColumns={{
            sm: "1fr",
            md: "2fr",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
            "2xl": "repeat(5, 1fr)",
          }}
        >
          {[
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1,
          ].map((index) => (
            <Room key={index} />
          ))}
        </Grid>
      );
    }
    ```

    - 단순히 `array`를 작성해 `room`을 많이 만들어 어떻게 보이는지 확인할 수 있다.

      > `array`의 내용은 상관 없다.

    - `Chakra` 컴포넌트에 있는 모든 `prop`에는 반응형 디자인을 적용할 수 있다.

      - 아래와 같이 화면의 크기에 맞춰 값을 정할 수 있다.

        ```tsx
          px={{
            sm: 10,
            lg: 20,
          }}
          templateColumns={{
            sm: "1fr",
            md: "2fr",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
            "2xl": "repeat(5, 1fr)",
          }}
        ```

  - `components/Room.tsx`

    ```tsx
    import {
      VStack,
      Grid,
      HStack,
      Box,
      Image,
      Text,
      useColorModeValue,
    } from "@chakra-ui/react";
    import { FaRegHeart, FaStar } from "react-icons/fa";

    export default function Room() {
      const gray = useColorModeValue("gray.600", "gray.300");
      return (
        <VStack spacing={1} alignItems={"flex-start"}>
          <Box position={"relative"} overflow={"hidden"} mb={2} rounded={"3xl"}>
            <Image
              minH={"250"}
              src="https://a0.muscache.com/im/pictures/miso/
              Hosting-706856413814921022/original/
              0f516c0a-18fc-4d49-b997-112bd1ea2a41.jpeg?im_w=720"
            />
            <Box
              cursor={"pointer"}
              position={"absolute"}
              top={5}
              right={5}
              color={"white"}
            >
              <FaRegHeart size={"20px"} />
            </Box>
          </Box>
          <Box>
            <Grid gap={2} templateColumns={"5fr 1fr"}>
              <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
                한국 Oedong-eup, Gyeongju
              </Text>
              <HStack spacing={1}>
                <FaStar size={15} />
                <Text>5.0</Text>
              </HStack>
            </Grid>
            <Text fontSize={"sm"} color={gray}>
              288km 거리
            </Text>
          </Box>
          <Text fontSize={"sm"} color={gray}>
            <Text as={"b"}>₩593,412 </Text>/박
          </Text>
        </VStack>
      );
    }
    ```

<br>

### Skeletons

- `Skeleton`으로 로딩 애니메이션을 만들어보자.

  - `routes/Home.tsx`

    ```tsx
    import { Box, Grid, Skeleton, SkeletonText } from "@chakra-ui/react";

    export default function home() {
      return (
        <Grid
          mt={"10"}
          px={{
            sm: 10,
            lg: 20,
          }}
          columnGap={"4"}
          rowGap={"8"}
          templateColumns={{
            sm: "1fr",
            md: "2fr",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
            "2xl": "repeat(5, 1fr)",
          }}
        >
          <Box>
            <Skeleton rounded={"2xl"} height={250} mb={7} />
            <SkeletonText w={"50%"} noOfLines={3} />
          </Box>
        </Grid>
      );
    }
    ```

---

## REACT QUERY

### Manual Fetching

- 프론트엔드와 백엔드를 연결시켜보자.

  - `http://127.0.0.1:8000/api/v1/rooms/`이 `url`을 `fetch`할 것이다.

- `routes/Home.tsx`

  ```tsx
  import { Grid } from "@chakra-ui/react";
  import RoomSkeleton from "../components/RoomSkeletom";
  import { useEffect } from "react";

  export default function home() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      fetch("http://127.0.0.1:8000/api/v1/rooms/"); /* fetch */
    }, []);
    return (
      <Grid
        mt={"10"}
        px={{
          sm: 10,
          lg: 20,
        }}
        columnGap={"4"}
        rowGap={"8"}
        templateColumns={{
          sm: "1fr",
          md: "2fr",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
          "2xl": "repeat(5, 1fr)",
        }}
      ></Grid>
    );
  }
  ```

  - 서버가 `user`에게 서버로부터 무언가를 `fetch`하는 것을 허용하지 않기 때문에, 직접 몇몇 `url`을 `fetch`하는 것을 허용해야 한다.

- 이를 위해 `django-cors-headers`를 설치해야 한다.

  - `poetry add django-cors-headers`

  - `config/settings.py`에서 `corsheaders`를 추가한다.

    - `config/settings.py`

      ```py
      # Application definition
      THIRD_PARTY_APPS = [
          "rest_framework",
          "rest_framework.authtoken",
          "corsheaders",  # 추가
      ]

      ...

      MIDDLEWARE = [
          "django.middleware.security.SecurityMiddleware",
          "django.contrib.sessions.middleware.SessionMiddleware",
          "corsheaders.middleware.CorsMiddleware",  # 추가
          "django.middleware.common.CommonMiddleware",
          "django.middleware.csrf.CsrfViewMiddleware",
          "django.contrib.auth.middleware.AuthenticationMiddleware",
          "django.contrib.messages.middleware.MessageMiddleware",
          "django.middleware.clickjacking.XFrameOptionsMiddleware",
      ]

      ...

      CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
      ```

      - 서버로부터 `localhost:3000`이 `fetch`하는 것을 허용시킨다.

- `routes/Home.tsx`

  ```tsx
  import { Grid } from "@chakra-ui/react";
  import RoomSkeleton from "../components/RoomSkeletom";
  import { useEffect, useState } from "react";
  import Room from "../components/Room";

  interface IPhoto {
    pk: string;
    file: string;
    description: string;
  }

  interface IRoom {
    pk: number;
    name: string;
    country: string;
    city: string;
    price: number;
    rating: number;
    is_owner: boolean;
    photos: IPhoto[];
  }

  export default function Home() {
    const [isLoading, setIsloading] = useState(true);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const fetchRooms = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/v1/rooms/");
      const json = await response.json();
      setRooms(json);
      setIsloading(false);
    };
    useEffect(() => {
      fetchRooms();
    }, []);
    return (
      <Grid
        mt={"10"}
        px={{
          sm: 10,
          lg: 20,
        }}
        columnGap={"4"}
        rowGap={"8"}
        templateColumns={{
          sm: "1fr",
          md: "2fr",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
          "2xl": "repeat(5, 1fr)",
        }}
      >
        {isLoading ? (
          <>
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
          </>
        ) : null}
        {rooms.map((room) => (
          <Room
            imageUrl={
              room.photos[0]?.file ??
              `https://source.unsplash.com/random/450x450`
            }
            name={room.name}
            rating={room.rating}
            city={room.city}
            country={room.country}
            price={room.price}
          />
        ))}
      </Grid>
    );
  }
  ```

- `components/Room.tsx`

  ```tsx
  import {
    VStack,
    Grid,
    HStack,
    Box,
    Image,
    Text,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { FaRegHeart, FaStar } from "react-icons/fa";

  interface IRoomProps {
    imageUrl: string;
    name: string;
    rating: number;
    city: string;
    country: string;
    price: number;
  }

  export default function Room({
    imageUrl,
    name,
    rating,
    city,
    country,
    price,
  }: IRoomProps) {
    const gray = useColorModeValue("gray.600", "gray.300");
    return (
      <VStack spacing={1} alignItems={"flex-start"}>
        <Box position={"relative"} overflow={"hidden"} mb={2} rounded={"3xl"}>
          <Image minH={"250"} src={imageUrl} />
          <Box
            cursor={"pointer"}
            position={"absolute"}
            top={5}
            right={5}
            color={"white"}
          >
            <FaRegHeart size={"20px"} />
          </Box>
        </Box>
        <Box>
          <Grid gap={2} templateColumns={"5fr 1fr"}>
            <Text display={"block"} noOfLines={1} as="b" fontSize={"md"}>
              {name}
            </Text>
            <HStack
              _hover={{
                color: "red.100",
              }}
              spacing={1}
            >
              <FaStar size={15} />
              <Text>{rating}</Text>
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
    );
  }
  ```

<br>

### React Query

- `TanStack Query`(`React Query`)를 사용해보자.

  - `React Query`를 사용하면 `fetch`를 편하게 할 수 있다.

- `fontend`에서 설치를 한다.

  - `npm i @tanstack/react-query`

- `src/index.tsx`

  ```tsx
  import React from "react";
  import ReactDOM from "react-dom/client";
  import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
  import { RouterProvider } from "react-router-dom";
  import router from "./router";
  import theme from "./theme";
  import {
    QueryClient,
    QueryClientProvider,
  } from "@tanstack/react-query"; /* import */

  const client = new QueryClient();

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={client}>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <RouterProvider router={router} />
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
  ```

  - `QueryClient`, `QueryClientProvider`를 `import` 하고 어플리케이션을 `QueryClientProvider`로 감싸준다.

- `React Query`를 사용하면 `fetch` 했던 모든걸 기억해서 다른 페이지를 갔다와도 다시 `fecth`하지 않아도 된다.

  - `api.ts`파일을 만들어 `api`를 `fetch`하기 위해 적었던 함수를 가져온다.

    - `src/api.ts`

      ```ts
      const BASE_URL = "http://127.0.0.1:8000/api/v1/";

      export async function getRooms() {
        const response = await fetch(`${BASE_URL}/rooms/`);
        const json = await response.json();
        return json;
      }
      ```

      - `fetch`를 위해 하나의 파일만 사용하게 되어서 `BASE_URL`을 설정할 수 있다.

- `Home.tsx`에서 `fetch`하는 부분을 전부 지우고 `useQuery`를 사용한다.

  - `routes/Home.tsx`

    ```tsx
    import { Grid } from "@chakra-ui/react";
    import RoomSkeleton from "../components/RoomSkeletom";
    import { useQuery } from "@tanstack/react-query"; /* import */
    import Room from "../components/Room";
    import { getRooms } from "../api"; /* import */

    interface IPhoto {
      pk: string;
      file: string;
      description: string;
    }

    interface IRoom {
      pk: number;
      name: string;
      country: string;
      city: string;
      price: number;
      rating: number;
      is_owner: boolean;
      photos: IPhoto[];
    }

    export default function Home() {
      const { isLoading, data } = useQuery<IRoom[]>({
        queryKey: ["rooms"],
        queryFn: getRooms,
      });
      return (
        <Grid
          mt={"10"}
          px={{
            sm: 10,
            lg: 20,
          }}
          columnGap={"4"}
          rowGap={"8"}
          templateColumns={{
            sm: "1fr",
            md: "2fr",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
            "2xl": "repeat(5, 1fr)",
          }}
        >
          {isLoading ? (
            <>
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
              <RoomSkeleton />
            </>
          ) : null}
          {data?.map((room) => (
            <Room
              imageUrl={
                room.photos[0]?.file ??
                `https://source.unsplash.com/random/450x450`
              }
              name={room.name}
              rating={room.rating}
              city={room.city}
              country={room.country}
              price={room.price}
            />
          ))}
        </Grid>
      );
    }
    ```

    - `QueryKey`와 `QueryFn`을 설정한다.

      - `Key`는 `fetch`한 결과물을 기억하는 캐싱 작업에 사용된다.
      - `Function`은 `Query`가 `fetch`하는 `getRooms` 함수를 사용한다.

    - `useQuery`는 `fetch` 작업에 대한 모든 데이터를 가져와준다.

      - `isLoading`, `data`
        > `data`는 리턴되는 `json`임

    - `rooms.map((room) =>())`에서 `rooms` 대신 `data`를 넣는다.
      - `TypeScrip`는 `data` 안에 뭐가 들었는지 모르기 때문에
        - `useQuery<IRoom[]>`으로 `IRoom` 목록이 들어있다고 알려준다.
      - `data`가 `undefined`일 수도 있기 때문에 `?`를 적어준다.

<br>

### Axios

- `api.ts`의 코드를 `Axios`를 사용해 바꿔보자.

  - `frontend`에서 `axios`를 설치한다.
    - `npm i axios`

- 기존 `api.ts`

  - `src/api.ts`

    ```ts
    const BASE_URL = "http://127.0.0.1:8000/api/v1/";

    export async function getRooms() {
      const response = await fetch(`${BASE_URL}/rooms/`);
      const json = await response.json();
      return json;
    }
    ```

- 바뀐 `src/api.ts`

  - `src/api.ts`

    ```ts
    import axios from "axios";
    const BASE_URL = "http://127.0.0.1:8000/api/v1/";

    export async function getRooms() {
      const response = await axios.get(`${BASE_URL}/rooms/`);
      return response.data;
    }
    ```

  - `src/api.ts`

    ```ts
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
    });

    export async function getRooms() {
      const response = await instance.get(`/rooms/`);
      return response.data;
    }
    ```

  - `src/api.ts`

    ```ts
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
    });

    export const getRooms = () =>
      instance.get("rooms/").then((response) => response.data);
    ```

<br>

### Room Detail

- `room`의 세부 정보를 표시하는 화면을 만들어보자.

  - `components/Room.tsx`

    ```tsx
    import {
      VStack,
      Grid,
      HStack,
      Box,
      Image,
      Text,
      useColorModeValue,
    } from "@chakra-ui/react";
    import { FaRegHeart, FaStar } from "react-icons/fa";
    import { Link } from "react-router-dom";

    interface IRoomProps {
      imageUrl: string;
      name: string;
      rating: number;
      city: string;
      country: string;
      price: number;
      pk: number /* 추가 */;
    }

    export default function Room({
      pk,
      imageUrl,
      name,
      rating,
      city,
      country,
      price,
    }: IRoomProps) {
      const gray = useColorModeValue("gray.600", "gray.300");
      return (
        <Link to={`/rooms/${pk}`}>
          <VStack spacing={1} alignItems={"flex-start"}>
            ...
          </VStack>
        </Link>
      );
    }
    ```

    - `VStack` 부분을 `react-router-dom`의 `Link`로 감싼 뒤 `pk`에 맞는 `room`으로 이동하게 한다.

  - `room`의 `pk`를 `prop`으로 내보내야 한다.

    - `routes/Home.tsx`

      ```tsx
      import { Grid } from "@chakra-ui/react";
      import RoomSkeleton from "../components/RoomSkeletom";
      import { useQuery } from "@tanstack/react-query";
      import Room from "../components/Room";
      import { getRooms } from "../api";

      interface IPhoto {
        pk: string;
        file: string;
        description: string;
      }

      interface IRoom {
        pk: number;
        name: string;
        country: string;
        city: string;
        price: number;
        rating: number;
        is_owner: boolean;
        photos: IPhoto[];
      }

      export default function Home() {
        const { isLoading, data } = useQuery<IRoom[]>({
          queryKey: ["rooms"],
          queryFn: getRooms,
        });
        return (
          <Grid
            mt={"10"}
            px={{
              sm: 10,
              lg: 20,
            }}
            columnGap={"4"}
            rowGap={"8"}
            templateColumns={{
              sm: "1fr",
              md: "2fr",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
              "2xl": "repeat(5, 1fr)",
            }}
          >
            {isLoading ? (
              <>
                <RoomSkeleton />
              </>
            ) : null}
            {data?.map((room) => (
              <Room
                key={room.pk}
                pk={room.pk} /* 추가 */
                imageUrl={
                  room.photos[0]?.file ??
                  `https://source.unsplash.com/random/450x450`
                }
                name={room.name}
                rating={room.rating}
                city={room.city}
                country={room.country}
                price={room.price}
              />
            ))}
          </Grid>
        );
      }
      ```

- `RoomDetail.tsx`를 만들어서 세부 정보를 불러오자.

  - `routes/RoomDetail.tsx`

    ```tsx
    import { useQuery } from "@tanstack/react-query";
    import { useParams } from "react-router-dom";
    import { getRoom } from "../api";

    export default function RoomDetail() {
      const { roomPk } = useParams();
      const { isLoading, data } = useQuery({
        queryKey: [`room:${roomPk}`],
        queryFn: getRoom,
      });
      console.log(data);
      return <h1>Hello!</h1>;
    }
    ```

    - `useParams()`으로 `url`의 변수를 가져온다.

      > `roomPk`

    - `useQuery`를 사용해 `fetch`하는 함수를 만든다.

  - `router`에 `RoomDetail`을 추가한다.

    - `src/router.tsx`

      ```tsx
      import { createBrowserRouter } from "react-router-dom";
      import Root from "./components/Root";
      import Home from "./routes/Home";
      import NotFound from "./routes/NotFound";
      import RoomDetail from "./routes/RoomDetail"; /* import */
      const router = createBrowserRouter([
        {
          path: "/",
          element: <Root />,
          errorElement: <NotFound />,
          children: [
            {
              path: "",
              element: <Home />,
            },
            {
              path: "rooms/:roomPk" /* 추가 */,
              element: <RoomDetail />,
            },
          ],
        },
      ]);

      export default router;
      ```

      - `path`에 `url`에서 받고 싶은 것을 파라미터로 특정할 수 있다.

<br>

### Devtools and Query Keys

- `Devtools`를 설치하면 `Query`가 어떻게 동작하고 저장되는지 볼 수 있다.

  - `frontend`에서 `devtools`를 설치한다.

    - `npm i @tanstack/react-query-devtools`

  - `Root.tsx`에 추가하자.

    - `components/Root.tsx`

      ```tsx
      import { Box } from "@chakra-ui/react";
      import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; /* import */
      import { Outlet } from "react-router-dom";
      import Header from "./Header";

      export default function Root() {
        return (
          <Box>
            <Header />
            <Outlet />
            <ReactQueryDevtools /> /* 추가 */
          </Box>
        );
      }
      ```

- 변수를 `fetch` 함수로 보내보자.

  - `src/api.ts`

    ```ts
    import { QueryFunctionContext } from "@tanstack/react-query"; /* import */
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
    });

    export const getRooms = () =>
      instance.get("rooms/").then((response) => response.data);

    export const getRoom = (something) => {
      console.log(something);
      return instance.get(`rooms/2`).then((response) => response.data);
    };
    ```

    - `RoomDetail.tsx`에서 `useQuery`가 `getRoom` 함수를 호출할 때 기본적으로 받아오는게 있다.

      - 이를 확인해보면

        ```
        {queryKey: Array(2), meta: undefined}
        meta
        :
        undefined
        queryKey
        :
        (2) ['rooms', '2']
        signal
        :
        (...)
        get signal
        :
        () => {…}
        [[Prototype]]
        :
        Object
        ```

        - `queryKey`에서 `rooms`와 `roomPk`를 받을 수 있다.

  - `qeuryKey`에서 `roomPk`만 받아오자.

    ```ts
    import { QueryFunctionContext } from "@tanstack/react-query";
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
    });

    export const getRooms = () =>
      instance.get("rooms/").then((response) => response.data);

    export const getRoom = ({ queryKey }: QueryFunctionContext) => {
      const [_, roomPk] = queryKey;
      return instance.get(`rooms/${roomPk}`).then((response) => response.data);
    };
    ```

    - 반드시 리턴을 해주어야 한다.

<br>

### Photos Grid

- `TypeScript`에게 데이터를 설명하는 `types.d.ts` 파일을 만든다.

  - `src/types.d.ts`

    ```ts
    export interface IRoomPhotoPhoto {
      pk: string;
      file: string;
      description: string;
    }

    export interface IRoomList {
      pk: number;
      name: string;
      country: string;
      city: string;
      price: number;
      rating: number;
      is_owner: boolean;
      photos: IRoomPhotoPhoto[];
    }

    export interface IRoomOwner {
      name: string;
      avatar: string;
      username: string;
    }

    export interface IAmenity {
      name: string;
      description: string;
    }

    export interface IRoomDetail extends IRoomList {
      created_at: string;
      updated_at: string;
      rooms: number;
      toilets: number;
      description: string;
      address: string;
      pet_friendly: true;
      kind: string;
      is_owner: boolean;
      is_liked: boolean;
      category: {
        name: string;
        kind: string;
      };
      owner: IRoomOwner;
      amenities: IAmenity[];
    }
    ```

    - 필요한 `interface`를 `import` 하면 된다.

- `room` 상세 화면의 `UI`를 만들어보자.

  - `routes/RoomDetail.tsx`

    ```tsx
    import { useQuery } from "@tanstack/react-query";
    import { useParams } from "react-router-dom";
    import { getRoom } from "../api";
    import { IRoomDetail } from "../types";
    import {
      Box,
      Grid,
      GridItem,
      Heading,
      Image,
      Skeleton,
    } from "@chakra-ui/react";

    export default function RoomDetail() {
      const { roomPk } = useParams();
      const { isLoading, data } = useQuery<IRoomDetail>({
        queryKey: [`rooms`, roomPk],
        queryFn: getRoom,
      });
      return (
        <Box
          mt={"10"}
          px={{
            sm: 10,
            lg: 20,
          }}
        >
          <Skeleton height={"43px"} width={"25%"} isLoaded={!isLoading}>
            <Heading>{data?.name}</Heading>
          </Skeleton>
          <Grid
            mt={7}
            rounded={"xl"}
            overflow={"hidden"}
            gap={2}
            height="60vh"
            templateRows={"1fr 1fr"}
            templateColumns={"repeat(4, 1fr)"}
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <GridItem
                colSpan={index === 0 ? 2 : 1}
                rowSpan={index === 0 ? 2 : 1}
                overflow={"hidden"}
                key={index}
              >
                <Skeleton isLoaded={!isLoading} h={"100%"} w={"100%"}>
                  <Image
                    objectFit={"cover"}
                    w={"100%"}
                    h={"100%"}
                    src={data?.photos[index].file}
                  />
                </Skeleton>
              </GridItem>
            ))}
          </Grid>
        </Box>
      );
    }
    ```

<br>

### Reviews

- `room` 주인, 프로필 사진, 별점 및 리뷰 개수를 만들어보자.

  - `routes/RoomDetail.tsx`

    ```tsx
    import { useQuery } from "@tanstack/react-query";
    import { useParams } from "react-router-dom";
    import { getRoom, getRoomReviews } from "../api";
    import { IReview, IRoomDetail } from "../types";
    import {
      Avatar,
      Box,
      Grid,
      GridItem,
      HStack,
      Heading,
      Image,
      Skeleton,
      Text,
      VStack,
    } from "@chakra-ui/react";
    import { FaStar } from "react-icons/fa";

    export default function RoomDetail() {
      const { roomPk } = useParams();
      const { isLoading, data } = useQuery<IRoomDetail>({
        queryKey: [`rooms`, roomPk],
        queryFn: getRoom,
      });
      const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<
        IReview[]
      >({
        queryKey: [`rooms`, roomPk, `reviews`],
        queryFn: getRoomReviews,
      });
      return (
        <Box
          mt={"10"}
          px={{
            sm: 10,
            lg: 20,
          }}
        >
          <Skeleton height={"43px"} width={"25%"} isLoaded={!isLoading}>
            <Heading>{data?.name}</Heading>
          </Skeleton>
          <Grid
            mt={7}
            rounded={"xl"}
            overflow={"hidden"}
            gap={2}
            height="60vh"
            templateRows={"1fr 1fr"}
            templateColumns={"repeat(4, 1fr)"}
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <GridItem
                colSpan={index === 0 ? 2 : 1}
                rowSpan={index === 0 ? 2 : 1}
                overflow={"hidden"}
                key={index}
              >
                <Skeleton isLoaded={!isLoading} h={"100%"} w={"100%"}>
                  <Image
                    objectFit={"cover"}
                    w={"100%"}
                    h={"100%"}
                    src={data?.photos[index].file}
                  />
                </Skeleton>
              </GridItem>
            ))}
          </Grid>
          <HStack w={"50%"} justifyContent={"space-between"} mt={10}>
            <VStack alignItems={"flex-start"}>
              <Skeleton isLoaded={!isLoading} height={"30px"}>
                <Heading fontSize={"2xl"}>
                  House hosted by {data?.owner.username}
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={!isLoading} height={"30px"}>
                <HStack justifyContent={"flex-start"} w={"100%"}>
                  <Text>
                    {data?.toilets} toilet{data?.toilets === 1 ? "" : "s"}
                  </Text>
                  <Text>•</Text>
                  <Text>
                    {data?.rooms} room{data?.rooms === 1 ? "" : "s"}
                  </Text>
                </HStack>
              </Skeleton>
            </VStack>
            <Avatar
              name={data?.owner.username}
              size={"xl"}
              src={data?.owner.avatar}
            />
          </HStack>
          <Box mt={10}>
            <Heading fontSize={"2xl"}>
              <Skeleton w={"15%"} isLoaded={!isLoading} height={"30px"}>
                <HStack>
                  <FaStar /> <Text> {data?.rating}</Text>
                  <Text>•</Text>
                  <Text>
                    {reviewsData?.length} review
                    {reviewsData?.length === 1 ? "" : "s"}
                  </Text>
                </HStack>
              </Skeleton>
            </Heading>
          </Box>
        </Box>
      );
    }
    ```

  - `src/api.ts`

    ```ts
    import { QueryFunctionContext } from "@tanstack/react-query";
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
    });

    export const getRooms = () =>
      instance.get("rooms/").then((response) => response.data);

    export const getRoom = ({ queryKey }: QueryFunctionContext) => {
      const [_, roomPk] = queryKey;
      return instance.get(`rooms/${roomPk}`).then((response) => response.data);
    };

    export const getRoomReviews = ({ queryKey }: QueryFunctionContext) => {
      const [_, roomPk] = queryKey;
      return instance
        .get(`rooms/${roomPk}/reviews`)
        .then((response) => response.data);
    };
    ```

    - `review` 데이터를 얻기 위해 `rooms/roomPk/reviews` `url`을 `fetch`하는 함수를 만든다.

<br>

### Conclusions

- `user`의 리뷰를 표시해보자.

  - `routes/RoomDetail.tsx`

    ```tsx
    import { useQuery } from "@tanstack/react-query";
    import { useParams } from "react-router-dom";
    import { getRoom, getRoomReviews } from "../api";
    import { IReview, IRoomDetail } from "../types";
    import {
      Avatar,
      Box,
      Container /* import */,
      Grid,
      GridItem,
      HStack,
      Heading,
      Image,
      Skeleton,
      Text,
      VStack,
    } from "@chakra-ui/react";
    import { FaStar } from "react-icons/fa";

    export default function RoomDetail() {
      const { roomPk } = useParams();
      const { isLoading, data } = useQuery<IRoomDetail>({
        queryKey: [`rooms`, roomPk],
        queryFn: getRoom,
      });
      const { data: reviewsData, isLoading: isReviewsLoading } = useQuery<
        IReview[]
      >({
        queryKey: [`rooms`, roomPk, `reviews`],
        queryFn: getRoomReviews,
      });
      return (
        <Box
          mt={"10"}
          px={{
            sm: 10,
            lg: 20,
          }}
        >
          <Skeleton height={"43px"} width={"25%"} isLoaded={!isLoading}>
            <Heading>{data?.name}</Heading>
          </Skeleton>
          <Grid
            mt={7}
            rounded={"xl"}
            overflow={"hidden"}
            gap={2}
            height="60vh"
            templateRows={"1fr 1fr"}
            templateColumns={"repeat(4, 1fr)"}
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <GridItem
                colSpan={index === 0 ? 2 : 1}
                rowSpan={index === 0 ? 2 : 1}
                overflow={"hidden"}
                key={index}
              >
                <Skeleton isLoaded={!isLoading} h={"100%"} w={"100%"}>
                  <Image
                    objectFit={"cover"}
                    w={"100%"}
                    h={"100%"}
                    src={data?.photos[index].file}
                  />
                </Skeleton>
              </GridItem>
            ))}
          </Grid>
          <HStack w={"50%"} justifyContent={"space-between"} mt={10}>
            <VStack alignItems={"flex-start"}>
              <Skeleton isLoaded={!isLoading} height={"30px"}>
                <Heading fontSize={"2xl"}>
                  House hosted by {data?.owner.username}
                </Heading>
              </Skeleton>
              <Skeleton isLoaded={!isLoading} height={"30px"}>
                <HStack justifyContent={"flex-start"} w={"100%"}>
                  <Text>
                    {data?.toilets} toilet{data?.toilets === 1 ? "" : "s"}
                  </Text>
                  <Text>•</Text>
                  <Text>
                    {data?.rooms} room{data?.rooms === 1 ? "" : "s"}
                  </Text>
                </HStack>
              </Skeleton>
            </VStack>
            <Avatar
              name={data?.owner.username}
              size={"xl"}
              src={data?.owner.avatar}
            />
          </HStack>
          <Box mt={10}>
            <Heading mb={5} fontSize={"2xl"}>
              <Skeleton w={"15%"} isLoaded={!isLoading} height={"30px"}>
                <HStack>
                  <FaStar /> <Text> {data?.rating}</Text>
                  <Text>•</Text>
                  <Text>
                    {reviewsData?.length} review
                    {reviewsData?.length === 1 ? "" : "s"}
                  </Text>
                </HStack>
              </Skeleton>
            </Heading>
            <Container marginX={"none"} maxW={"container.xl"} mt={10}>
              <Grid templateColumns={"repeat(2, 1fr)"} gap={10}>
                {isReviewsLoading
                  ? [1, 2, 3, 4].map((dummy) => (
                      <Box>
                        <VStack alignItems={"flex-start"}>
                          <HStack>
                            <Avatar size={"md"}></Avatar>
                            <VStack alignItems={"flex-start"} spacing={1}>
                              <Skeleton w={"200px"} h="25px">
                                <Heading fontSize={"md"}>Loading...</Heading>
                              </Skeleton>

                              <Skeleton w={"50px"} h="10px">
                                <HStack spacing={1}>
                                  <FaStar size={"12px"}></FaStar>
                                  <Text>Loading...</Text>
                                </HStack>
                              </Skeleton>
                            </VStack>
                          </HStack>
                          <Skeleton w={"500px"} h={"150px"}>
                            <Text>Loading...</Text>
                          </Skeleton>
                        </VStack>
                      </Box>
                    ))
                  : reviewsData?.map((review, index) => (
                      <Box>
                        <VStack spacing={3} alignItems={"flex-start"}>
                          <HStack spacing={4}>
                            <Avatar
                              name={review.user.username}
                              src={review.user.avatar}
                              size={"md"}
                            ></Avatar>
                            <VStack alignItems={"flex-start"} spacing={0}>
                              <Heading fontSize={"md"}>
                                {review.user.username}
                              </Heading>
                              <HStack spacing={1}>
                                <FaStar size={"12px"}></FaStar>
                                <Text>{review.rating}</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <Text>{review.payload}</Text>
                        </VStack>
                      </Box>
                    ))}
              </Grid>
            </Container>
          </Box>
        </Box>
      );
    }
    ```

---

## AUTHENTICATION

### useUser

- 로그인을 했을 때 로그인을 했는지 안 했는지 알려줘보자.

  - `api`에 사용자 정보를 가져오는 `fetcher`를 만든다.

    - `src/api.ts`

      ```ts
      import { QueryFunctionContext } from "@tanstack/react-query";
      import axios from "axios";

      const instance = axios.create({
        baseURL: "http://127.0.0.1:8000/api/v1/",
      });

      ...

      export const getMe = () =>
        instance.get(`users/me`).then((response) => response.data);
      ```

- `src`에 `lib` 폴더를 만들고 `useUser`라는 `Hook`을 만든다.

  - `src/lib/useUser.ts`

    ```ts
    import { useQuery } from "@tanstack/react-query";
    import { getMe } from "../api";

    export default function useUser() {
      const { isLoading, data, isError } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        retry: false,
      });
      return {
        userLoading: isLoading,
        user: data,
        isLoggedIn: !isError,
      };
    }
    ```

    - 이 `hook`은 `getMe`를 `react query`와 같이 호출하는 기능을 한다.

      > `isError`는 `True` 또는 `False`를 `query`의 `error`에 따라 반환한다.

    <details>
    <summary>retry: false</summary>
    <markdown="1">
    <div>

    - `react query`에는 `fetch`를 실패해도 여러 번 재시도를 하는 기능이 있다.

      - 지금과 같은 경우 로그인을 하지 않았을 때(`isError`) 로그인을 재시도하면 안되기 때문에, 재시도를 하지 않게 할 수 있따.

    </div>
    </details>

- `Header`에서 `useUser`가 리턴한 값을 받아올 수 있다.

  - `src/Header.tsx`

    ```tsx
    import {
      HStack,
      IconButton,
      Button,
      Box,
      useDisclosure,
      useColorMode,
      LightMode,
      useColorModeValue,
      Stack,
      Avatar,
    } from "@chakra-ui/react";
    import { FaAirbnb, FaMoon, FaSun } from "react-icons/fa";
    import LoginModal from "./LoginModal";
    import SignUpModal from "./SignUpModal";
    import useUser from "../lib/useUser";

    export default function Header() {
      const { userLoading, isLoggedIn, user } = useUser(); // 받아오기
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
      return (
        <Stack
          justifyContent={"space-between"}
          alignItems={"center"}
          py={5}
          px={20}
          direction={{
            sm: "column",
            md: "row",
          }}
          spacing={{
            sm: 4,
            md: 0,
          }}
          borderBottomWidth={1}
        >
          <Box color={logoColor}>
            <FaAirbnb size={"48px"} />
          </Box>
          <HStack spacing={"2"}>
            <IconButton
              onClick={toggleColorMode}
              variant="ghost"
              aria-label={"Toggle dark mode"}
              icon={<Icon />}
            />
            {!userLoading ? (
              !isLoggedIn ? (
                <>
                  <Button onClick={onLoginOpen}>Log in</Button>
                  <LightMode>
                    <Button onClick={onSignUpOpen} colorScheme="red">
                      Sign up
                    </Button>
                  </LightMode>
                </>
              ) : (
                <Avatar size={"md"} />
              )
            ) : null}
          </HStack>
          <LoginModal isOpen={isLoginOpen} onClose={onLoginCLose} />
          <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
        </Stack>
      );
    }
    ```

    > `<> fragment`를 사용하는 이유는 공통된 부모가 없는 `element`를 반환하는 것은 안되기 때문에 하나를 만들어주는 것이다.

    > `<Button>`과 `<LiteMode>`는 형제 관계임(서로 이웃해 있다.)

- 하지만 `admin`에서 로그인을 해도 로그인이 되어 있지 않다.

<br>

### Credentials

- 로그인이 안되는 문제를 해결하기 위해 `cookie`의 규칙을 알아야 한다.

  - `django`는 `SessionAuthentication`을 기본 인증으로 하고 있다. 이는 `cookie`에 의해 작동된다.

- 작동 방법

  - `user`가 로그인을 하면 `django`는 `database`에 `session object`를 만든다.

    > `session`은 랜덤한 `id`를 가지고 있다.

  - 또한 이 `session id`를 `cookie` 안에 넣어서 보내준다.

  - `cookie`의 규칙 때문에 `user`가 방문할 때마다 자동으로 브라우저는 `cookie`를 웹사이트에 전송한다.

    > `django`가 `cookie`를 만들고 `user`에게 `cookie`를 주면 같은 서버를 가진 웹사이트를 방문할 때 브라우저는 `cookie`를 백엔드에 전송한다.

- `cookie`의 `domain`을 확인해 브라우저가 어떤 `cookie`를 어떤 사이트에 전송하는지 알 수 있다.

  ![Alt text](./images/backend_cookie.png)

  - 백엔드에서의 `domain`은 `127.0.0.1`이다.

  - 프론트엔드에서의 `domain`도 `127.0.0.1`이다.

    ![Alt text](./images/frontend_cookie.png)

    > 원래 `localhost`여야 하는데 `domain`이 같은 이유는 모름

- `cookie`를 준 `domain`과 `api` 요청을 보내는 `domain`을 일치시켜야 한다.

  - 따라서 `localhost`를 사용하지 않고 `127.0.0.1`를 사용할 것이다.

    - 백엔드에서 `localhost` 대신 `127.0.0.1`를 허용한다고 해주어야 한다.

      - `backend/config/settings.py`

        ```py
        ...

        REST_FRAMEWORK = {
            ...
        }

        # CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
        CORS_ALLOWED_ORIGINS = [
            "http://127.0.0.1:3000",
        ]
        ```

- 하지만 여전히 로그인은 안된다.

  - 그 이유는 `fetch`를 하고 있기 때문이다.

    - `fetch`를 사용하면 `Javascript`에게 `cookie`를 포함시키라고 직접 얘기해야 한다.

      - 백엔드에서는 `Request Headers`에서 `cookie`를 보내고 있지만, 프론트엔드에서는 보내고 있지 않다.

        ![Alt text](./images/backend_header.png)

        > 백엔드 `Request Headers`

        ![Alt text](./images/frontend_header.png)

        > 프론트엔드 `Request Headers`

- 이를 해결하기 위해 `fetcher`의 `axios`를 수정하고 `django`에게 `credential`을 받는다고 알려주어야 한다.

  - `frontend/src/api.ts`

    ```ts
    import { QueryFunctionContext } from "@tanstack/react-query";
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
      withCredentials= true,
    });

    ...
    ```

    - `withCredentials= true` 설정은 `api`에 요청을 할 때 `cookie`를 보내겠다는 것이다.

  - `backend/config/settings.py`

    ```py
    ...

    CORS_ALLOWED_ORIGINS = [
        "http://127.0.0.1:3000",
    ]

    CORS_ALLOW_CREDENTIALS = True
    ```

    > CORS_ALLOW**ED**\_CREDENTIALS로 잘못 적으면 안됨

<br>

### Log Out

- 로그아웃 기능을 만들어보자.

  - `components/Header.tsx`

    ```tsx
    import {
    HStack,
    IconButton,
    Button,
    Box,
    useDisclosure,
    useColorMode,
    LightMode,
    useColorModeValue,
    Stack,
    Avatar,
    Menu,       // import
    MenuButton, // import
    MenuList,   // import
    MenuItem,   // import
    } from "@chakra-ui/react";
    ...

    export default function Header() {
      ...

      return (
          ...
            {!userLoading ? (
              !isLoggedIn ? (
                ...
              ) : (
                <Menu>
                  <MenuButton>
                    <Avatar name={user?.name} src={user?.avatar} size={"md"} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={onLogOut}>Log out</MenuItem>
                  </MenuList>
                </Menu>
              )
            ) : null}
          ...
      );
    }
    ```

    - 로그인이 되어 있을 때(`!isLoggedIn :`) 부분에 위와 같이 로그아웃 버튼을 만들어준다.

- `chakra-ui`의 `Toast`를 활용해 버튼을 눌렀을 때 알림을 만들어보자.

  - `components/Header.tsx`

    ```tsx
    import {
      HStack,
      IconButton,
      Button,
      Box,
      useDisclosure,
      useColorMode,
      LightMode,
      useColorModeValue,
      Stack,
      Avatar,
      Menu,
      MenuButton,
      MenuList,
      MenuItem,
      useToast, // import
    } from "@chakra-ui/react";
    import { FaAirbnb, FaMoon, FaSun } from "react-icons/fa";
    import LoginModal from "./LoginModal";
    import SignUpModal from "./SignUpModal";
    import useUser from "../lib/useUser";
    import { logOut } from "../api";  // import

    export default function Header() {
      ...
      const toast = useToast();
      const onLogOut = async () => {
        const toastId = toast({
          title: "Login out...",
          description: "Sad to see you go...",
          status: "loading",
          position: "bottom-right",
        });
        // const data = await logOut();
        // console.log(data);
        setTimeout(() => {
          toast.update(toastId, {
            status: "success",
            title: "Done!",
            description: "See you later!",
          });
        }, 5000);
      };
      return (
        ...
      );
    }
    ```

    - 아래와 같이 알림을 만들 수 있다.

      ![Alt text ](./videos/logOut.gif)

- `log-out url`로 `post` 요청을 하는 `api`를 만들어 `data`를 받아보면 `CSRF`라는 오류가 발생한다.

  - `src/api.ts`

    ```ts
    import { QueryFunctionContext } from "@tanstack/react-query";
    import axios from "axios";

    const instance = axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
      withCredentials: true,
    });

    ...

    export const logOut = () =>
      instance.post(`users/log-out`).then((response) => response.data);
    ```

<br>

### CSRF

- `CSRF`는 `cross-site request forgery`로 해커의 공격 방법 중 일종으로, 해커의 사이트로부터 `post` 요청을 보내도록 속이는 방법으로 `credentials`를 이용해 정보를 훔치는 것을 목적으로 한다.

- `django`에게 `http://127.0.0.1:3000`의 `domain`으로부터 오는 `post` 요청을 허락하도록 설정해야 한다.

  - `backend/config/settings.py`

    ```py
    CORS_ALLOW_CREDENTIALS = True

    CSRF_TRUSTED_ORIGINS = [
        "http://127.0.0.1:3000",
    ]
    ```

    - 여전히 로그아웃이 안된다.

- 그 이유는 `CSRF token`을 보내지 않았기 때문이다.

  - `django`는 `CSRF` 공격을 막기 위해 `token(csrftoken)`을 제공한다. 이는 `post` 요청을 보낼 때 같이 보내야 한다.

    - 즉 `axios`에 `CSRF cookie`를 넣어 주어야 한다는 것이다.

- `frontend`에 `js cookie`를 설치하고 `api`에서 `import` 해준다.

  - `npm i js-cookie`

  - `src/api.ts`

    ```ts
    import Cookie from "js-cookie"; // import
    import { QueryFunctionContext } from "@tanstack/react-query";
    import axios from "axios";

    ...

    export const logOut = () =>
      instance
        .post(`users/log-out`, null, {
          headers: {
            "X-CSRFToken": Cookie.get("csrftoken") || "",
          },
        })
        .then((response) => response.data);
    ```

    - `frontend`에서 `js-cookie`에 대한 `type declaration`을 해준다.

      - `npm i --save-dev @types/js-cookie`

    - `post` 요청은 `url`, `data`, `config` 순으로 필요하다. 로그아웃은 보낼 데이터는 없기 때문에 `null`로 작성한다.

- 로그아웃이 정상적으로 작동되지만, 다른 탭을 갔다가 오거나 새로 고침을 하여 `query`를 `fetch`해야 `header`가 바뀐다.

  - `react query`에 `fetch`를 강제로 `refetch` 할 수 있다.

    - `components/Header.tsx`

      ```tsx
      ...

      import { useQueryClient } from "@tanstack/react-query"; // import

      export default function Header() {

        ...

        const queryClient = useQueryClient();
        const onLogOut = async () => {
          const toastId = toast({
            title: "Login out...",
            description: "Sad to see you go...",
            status: "loading",
            position: "bottom-right",
          });
          await logOut();
          queryClient.refetchQueries({
            queryKey: ["me"],
            exact: true,
          });
          setTimeout(() => {
            toast.update(toastId, {
              status: "success",
              title: "Done!",
              description: "See you later!",
              duration: 2000,
            });
          }, 3000);
        };
        return (
          ...
        );
      }
      ```

      - `useQuerClient`를 사용해 `queryClient`의 모든 `query`에 대해 접근할 수 있다.

        - 로그아웃 `post` 요청을 하면, `query`들 중에 `user`가 로그인 되어 있는지 아닌지 확인하는 `me`만 `refetch`한다.

<br>

### Github Log In

- `github` 로그인을 구현해보자.

  - [authorizing-oauth-apps](https://docs.github.com/ko/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

    - 위 가이드를 따라가기 위해 새 `app`을 만들어야 한다.

- `https://github.com/settings/applications/new`에서 새로운 `app`을 만든다.

  ![Alt text](./images/create_OAuth_app.png)

  > `Authorization callback URL`: `github`가 `user`에게 정보 제공에 동의를 한 후 `redirect` 시키는 `url`

- `components/SocialLogin.tsx`

  ```tsx
  import { HStack, Divider, VStack, Button, Box, Text } from "@chakra-ui/react";
  import { FaGithub, FaComment } from "react-icons/fa";

  export default function SocialLogin() {
    return (
      <Box mb="4">
        <HStack my={8}>
          <Divider />
          <Text textTransform={"uppercase"} color="gray" fontSize={"xs"} as="b">
            Or
          </Text>
          <Divider />
        </HStack>
        <VStack>
          <Button
            as="a"
            href="https://github.com/login/oauth/authorize?client_id=10136d2489a8c313cbe4&scope=read:user,user:email"
            w="100%"
            leftIcon={<FaGithub />}
          >
            Continue with Github
          </Button>
          <Button w="100%" leftIcon={<FaComment />} colorScheme="yellow">
            Continue with Kakao
          </Button>
        </VStack>
      </Box>
    );
  }
  ```

  - 버튼을 눌렀을 때 설정한 링크로 갈 수 있게 `html tag`인 `anchor`로 바꾸고 `href`를 설정한다.

    - `user`의 `github id`를 `https://github.com/login/oauth/authorize`로 `get` 요청을 한다.

    - 이때, 어떤 앱이 로그인을 요청하는지 알리기 위해 `?client_id`에 아까 만든 `OAuth applicatoin`의 `Client ID`를 붙여넣는다.

      > `https://github.com/settings -> Developer Settings -> OAuth Apps`에서 `OAuth application` 확인 가능

    - `scope` 파라미터를 추가하여 `user`로부터 얻을 정보의 목록을 적을 수 있다.

      > `scope`를 적지 않으면 `user`의 `public` 정보만 받을 수 있다.

- `Authorize` 버튼을 누르면 `github`로 로그인 했을 때 설정한 링크로 이동된다.

  - `http://127.0.0.1:3000/social/github?code=c770209c40f0e865c56a`

<br>

### Github Code

- `github`가 코드와 함께 보낸 페이지를 만들어보자.

  - 새로운 `route`인 `GithubConfirm.tsx`를 만들고 `router`에 추가한다.

    - `src/router.tsx`

      ```tsx
      import { createBrowserRouter } from "react-router-dom";
      import Root from "./components/Root";
      import Home from "./routes/Home";
      import NotFound from "./routes/NotFound";
      import RoomDetail from "./routes/RoomDetail";
      import GithubConfirm from "./routes/GithubConfirm";
      const router = createBrowserRouter([
        {
          path: "/",
          element: <Root />,
          errorElement: <NotFound />,
          children: [
            {
              path: "",
              element: <Home />,
            },
            {
              path: "rooms/:roomPk",
              element: <RoomDetail />,
            },
            {
              path: "social",
              children: [
                {
                  path: "github",
                  element: <GithubConfirm />,
                },
              ],
            },
          ],
        },
      ]);

      export default router;
      ```

      - `social path`에 `github`와 카카오톡으로 로그인 하기를 만들기 때문에 `children` 안에 `github path`를 넣어준다.

- `routes/GithubConfirm.tsx`

  ```tsx
  import { Heading, VStack, Text, Spinner } from "@chakra-ui/react";
  import { useEffect } from "react";
  import { useLocation } from "react-router-dom";
  import { githubLogIn } from "../api";

  export default function GithubConfirm() {
    const { search } = useLocation();
    const confirmLogin = async () => {
      const params = new URLSearchParams(search);
      const code = params.get("code");
      await githubLogIn(code);
    };
    useEffect(() => {
      confirmLogin();
    }, []);
    return (
      <VStack justifyContent={"center"} mt={40}>
        <Heading>Processing log in...</Heading>
        <Text>Don't go anywhere.</Text>
        <Spinner size={"lg"} />
      </VStack>
    );
  }
  ```

  - `useLocation`으로 브라우저의 최신 `url`을 받아온다.

    > `{pathname: '/social/github', search: '?code=fa2db3359a496f665e75', hash: '', state: null}`

  - `URLSearchParams`로 `search`에 있는 코드를 받아온다.

    > `params = ?code=fa2db3359a496f665e75`

  - `code`에 코드만을 `get` 한다.

    > `code = fa2db3359a496f665e75`

- 이 코드를 전달하기 위해 새로운 `fetcher`를 만들어야 한다.

  - `src/api.ts`

    ```ts
    import Cookie from "js-cookie";
    import { QueryFunctionContext } from "@tanstack/react-query";
    import axios from "axios";

    ...

    export const githubLogIn = (code: string | null) =>
      instance
        .post(
          `/users/github`,
          { code },
          {
            headers: {
              "X-CSRFToken": Cookie.get("csrftoken") || "",
            },
          }
        )
        .then((response) => response.status);
    ```

    - `string` 또는 `null`인 `code`를 받고, 이를 `data`와 `headers`를 `/users/github`로 `post` 한다.

- `/users/github`에 요청을 해야 하므로 실제 `url`을 만들어야 한다.

  - `backend/users/urls.py`

    ```py
    from django.urls import path
    from rest_framework.authtoken.views import obtain_auth_token
    from . import views

    urlpatterns = [
        path("", views.Users.as_view()),
        path("me", views.Me.as_view()),
        path("change-password", views.ChangePassword.as_view()),
        path("log-in", views.LogIn.as_view()),
        path("log-out", views.LogOut.as_view()),
        path("token-login", obtain_auth_token),
        path("jwt-login", views.JWTLogIn.as_view()),
        path("github", views.GithubLogIn.as_view()),  # 추가
        path("@<str:username>", views.PublicUser.as_view()),
        path("@<str:username>/rooms", views.UserRooms.as_view()),
        path("@<str:username>/reviews", views.UserReviews.as_view()),
    ]
    ```

- `view`를 만들어 `url`과 연결시킨다.

  - `backend/users/views.py`

    ```py
    import jwt
    from django.conf import settings
    from django.contrib.auth import authenticate, login, logout
    from rest_framework.views import APIView
    from rest_framework.response import Response
    from rest_framework import status
    from rest_framework.exceptions import ParseError, NotFound
    from rest_framework.permissions import IsAuthenticated
    from users.models import User
    from rooms.models import Room
    from reviews.models import Review
    from reviews.serializers import ReviewSerializer
    from rooms.serializers import RoomListSerializer
    from . import serializers


    ...


    class GithubLogIn(APIView):
        def post(self, request):
            code = request.data.get("code")
            print(code)
            return Response()
    ```

    - 서버에서 `code`가 출력된다.

      - `b4bfd2279dc4ed0d56cf`

<br>

### Access Token

- `user`가 보낸 `token(code)`와 `Github API`의 `Access token`과 교환해야 한다.

  > 백엔드에서 `Github API`로 `post` 요청을 해야 함

  > `POST https://github.com/login/oauth/access_token`

  - `backend/poetry`에 `requests`를 추가한다.

    - `poetry add requests`

- `backend/users/views.py`

  ```py
  import jwt
  import requests # import
  from django.conf import settings

  ...

  class GithubLogIn(APIView):
      def post(self, request):
          code = request.data.get("code")
          access_token = requests.post(
              f"https://github.com/login/oauth/access_token?code={code}&client_id=10136d2489a8c313cbe4&client_secret={settings.GH_SECRET}",
              headers={"Accept": "application/json"},
          )
          access_token = access_token.json().get("access_token")
          user_data = requests.get(
              "https://api.github.com/user",
              headers={
                  "Authorization": f"Bearer {access_token}",
                  "Accept": "application/json",
              },
          )
          user_data = user_data.json()
  ```

  - `code`를 `https://github.com/login/oauth/access_token`에 `post` 요청을 한다.

    - 이때, `code`, `client_id`, `client_secret`을 필수로 보내야 한다.

      <details>
      <summary>client_secret 생성 및 저장</summary>
      <markdown="1">
      <div>

      - `client_secret`는 없으므로 새로 만들어준다.

        ![Alt text](./images/new_client_secret.png)

        > `Generate a new client secret`

      - `new client secret`은 다시 못 볼 수 있으므로 복사해서 저장해 두어야 한다.

        - `backend/.env`

          ```py
          SECRET_KEY="django-insecure-ws2(&m7bzak-..."
          GH_SECRET="06881765fe7846b836faf64..."
          ```

      - `setting`에도 설정한다.

        - `backend/config/settings.py`

          ```py
          ...

          CSRF_TRUSTED_ORIGINS = [
              "http://127.0.0.1:3000",
          ]

          GH_SECRET = env("GH_SECRET")
          ```

      </div>
      </details>

    - `headers`에서 `access_token`이 `json` 형태인지 확인하고 이를 출력해보면

      ```py
      print(access_token.json())
      > {'access_token': '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', 'token_type': 'bearer', 'scope': 'read:user,user:email'}
      ```

      - `access_token`을 확인할 수 있다.

  - 이제 이 `access_token`으로 `Github API`에게 `user data`를 요청할 수 있다.

    > `Authorization: Bearer OAUTH-TOKEN`

    > `GET https://api.github.com/user`

    - `https://api.github.com/user`로 `headers`와 같이 `get` 요청하고, `user_data.json()`을 출력해보면 아래와 같은 `json`을 얻을 수 있다.

      ```py
      {'login': 'siggu', 'id': 106001755, ... 'type': 'User',
      'site_admin': False, 'name': None, 'company': None,
      'blog': '', 'location': None, 'email': None, ... }
      ```

<br>

### Emails

- `user`의 `GitHub email`을 받아와 로그인을 해보자.

  - `email`을 가져오기 위해서는 `/user/emails`을 가지고 `GitHub API`에 `get` 요청을 해야 한다.

    - [GitHub Docs](https://docs.github.com/ko/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user)

- `backend/users/views.py`

  ```py
  import jwt
  import requests
  from django.conf import settings

  class GithubLogIn(APIView):
      def post(self, request):
          code = request.data.get("code")
          access_token = requests.post(
              f"https://github.com/login/oauth/access_token?code={code}&
              client_id=10136d2489a8c313cbe4&client_secret={settings.
              GH_SECRET}",
              headers={"Accept": "application/json"},
          )
          access_token = access_token.json().get("access_token")
          user_data = requests.get(
              "https://api.github.com/user",
              headers={
                  "Authorization": f"Bearer {access_token}",
                  "Accept": "application/json",
              },
          )
          user_data = user_data.json()
          user_emails = requests.get(
              "https://api.github.com/user/emails",
              headers={
                  "Authorization": f"Bearer {access_token}",
                  "Accept": "application/json",
              },
          )
          user_emails = user_emails.json()
          print(user_emails)
          return Response()
  ```

  - `user_emails`를 출력해보면

    ```
    > print(users_emails)
    [{'email': 'm0_w_0m@naver.com', 'primary': True, 'verified': True, 'visibility': 'private'}, {'email': '106001755+siggu@users.noreply.github.com', 'primary': False, 'verified': True, 'visibility': None}]
    ```

    - `email`을 확인할 수 있다.

- 현재 `api/v1/users/github`로 `post` 요청을 두 번 보내고 있다.

  - 로그인 후 `user`가 받은 `token`은 `GitHub API`의 `access token`과 오직 한 번만 교환이 가능하기 때문에 이를 고쳐야 한다.

    - 이는 `index.tsx`에서 `<React.StrictMode>`를 지우면 된다.

      - `frontend/src/index.tsx`

        ```tsx
        import React from "react";
        import ReactDOM from "react-dom/client";
        import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
        import { RouterProvider } from "react-router-dom";

        ...

        root.render(
          <QueryClientProvider client={client}>
            <ChakraProvider theme={theme}>
              <ColorModeScript
                initialColorMode={theme.config.initialColorMode}
              />
              <RouterProvider router={router} />
            </ChakraProvider>
          </QueryClientProvider>
        );
        ```

- 만약 `email`이 존재한다면 로그인을 하려는 것이고, `email`이 없다면 새로 가입을 하려는 것이다.

  - `backend/users/views.py`

    ```py
    import jwt
    import requests
    from django.conf import settings

    ...

    class GithubLogIn(APIView):
        def post(self, request):
            try:
                code = request.data.get("code")
                access_token = requests.post(
                    f"https://github.com/login/oauth/access_token?code=
                    {code}&client_id=10136d2489a8c313cbe4&client_secret=
                    {settings.GH_SECRET}",
                    headers={"Accept": "application/json"},
                )
                access_token = access_token.json().get("access_token")
                user_data = requests.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json",
                    },
                )
                user_data = user_data.json()
                user_emails = requests.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json",
                    },
                )
                user_emails = user_emails.json()
                try:
                    user = User.objects.get(email=user_emails[0]["email"])
                    login(request, user)
                    return Response(status=status.HTTP_200_OK)
                except User.DoesNotExist:
                    user = User.objects.create(
                        username=user_data.get("login"),
                        email=user_emails[0]["email"],
                        name=user_data.get("name"),
                        avatar=user_data.get("avatar_url"),
                    )
                    user.set_unusable_password()
                    user.save()
                    login(request, user)
                    return Response(status=status.HTTP_200_OK)
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)
    ```

    - `user`의 `email`과 일치하는 `user`가 존재한다면 로그인 시킨다.

      > `email`의 `verified` 정보를 활용할 수도 있음

    - `user`의 `email`과 일치하는 `user`가 없다면 `user_data`와 `user_emails`를 이용해 새로운 `user`를 만들고 `password`를 설정하고 저장 후 로그인 시킨다.

      > `github`로 로그인 하기 때문에, `password`로 로그인 할 수 없게 `unusable_password`로 설정

    - 위의 모든 과정을 `try-except`로 예외처리 해준다.

- `socialLogIn`에서 설정했듯이 로그인 했을 때 강제로 `refecth` 해준다.

  - `frontend/src/routes/GithubConfirm.tsx`

    ```tsx
    import { Heading, VStack, Text, Spinner, useToast } from "@chakra-ui/react";
    import { useEffect } from "react";
    import { useLocation, useNavigate } from "react-router-dom";
    import { githubLogIn } from "../api";
    import { useQueryClient } from "@tanstack/react-query"; // import

    export default function GithubConfirm() {
      const { search } = useLocation();
      const toast = useToast(); // toast 설정
      const queryClient = useQueryClient(); // queryClient 설정
      const navigate = useNavigate(); // navigate 설정
      const confirmLogin = async () => {
        const params = new URLSearchParams(search);
        const code = params.get("code");
        if (code) {
          const status = await githubLogIn(code);
          if (status === 200) {
            toast({
              status: "success",
              title: "Welcome!",
              description: "Happy to have you back!",
            });
            queryClient.refetchQueries({
              queryKey: ["me"],
              exact: true,
            });
            navigate("/");
          }
        }
      };
      useEffect(() => {
        confirmLogin();
      }, []);
      return (
        <VStack justifyContent={"center"} mt={40}>
          <Heading>Processing log in...</Heading>
          <Text>Don't go anywhere.</Text>
          <Spinner size={"lg"} />
        </VStack>
      );
    }
    ```

    - `useNavigate`를 활용해 로그인 했을 때 로그인에 성공한다면, 자동으로 `home`으로 보낸다.

<br>

### Kakao Talk App

- 카카오 로그인을 구현해보자.

  - 먼저 아래 링크에서 어플리케이션 추가를 해준다.

    - [developers.kakao.com](https://developers.kakao.com/console/app)

- 어플리케이션에 들어가 **카카오 로그인**에서 `활성화 설정`을 켜주고 `Redirect URI`를 등록해준다.

  - `Redirect URI`: `http://127.0.0.1:3000/social/kakao`

    ![Alt text](./images/kakao_setting1.png)

- **카카오 로그인** 밑에 있는 **동의항목**에서 닉네임, 프로필 사진, 카카오계정(이메일) 상태를 **필수 동의**로 설정한다.

  ![Alt text](./images/kakao_setting2.png)

  > 카카오계정(이메일)은 **비즈 앱**으로 전환 후 상태를 전환할 수 있다.

<br>

### Kakao Talk Auth

- 카카오에서 인가 코드를 받아보자.

  - [kakaologin/rest-api#request-code](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-code)

- `routes`에 `KakoConfirm.tsx`라는 `route`를 만들고 `social path`의 `children`에 추가한다.

  > `KakaoConfirm.tsx`에는 `GithubConfirm.tsx`의 모든 코드를 복붙해준다.

  - 그리고 `kakaoLogIn api`도 `githubLogIn`을 복사하고 이름만 바꿔준다.

    - `frontend/src/router.tsx`

      ```tsx
      import { createBrowserRouter } from "react-router-dom";
      import Root from "./components/Root";
      import Home from "./routes/Home";
      import NotFound from "./routes/NotFound";
      import RoomDetail from "./routes/RoomDetail";
      import GithubConfirm from "./routes/GithubConfirm";
      import KakaoConfirm from "./routes/KakaoConfirm"; // import
      const router = createBrowserRouter([
        {
          path: "/",
          element: <Root />,
          errorElement: <NotFound />,
          children: [
            {
              path: "",
              element: <Home />,
            },
            {
              path: "rooms/:roomPk",
              element: <RoomDetail />,
            },
            {
              path: "social",
              children: [
                {
                  path: "github",
                  element: <GithubConfirm />,
                },
                {
                  path: "kakao", // 추가
                  element: <KakaoConfirm />, // 추가
                },
              ],
            },
          ],
        },
      ]);

      export default router;
      ```

    - `frontend/src/api.ts`

      ```ts
      export const kakaoLogIn = (code: string | null) =>
        instance
          .post(
            `/users/kakao`,
            { code },
            {
              headers: {
                "X-CSRFToken": Cookie.get("csrftoken") || "",
              },
            }
          )
          .then((response) => response.status);
      ```

- `SocialLogin.tsx`에서 카카오 로그인 부분을 고친다.

  - `frontend/src/components/SocialLogin.tsx`

    ```tsx
    import {
      HStack,
      Divider,
      VStack,
      Button,
      Box,
      Text,
    } from "@chakra-ui/react";
    import { FaGithub, FaComment } from "react-icons/fa";

    export default function SocialLogin() {
      const kakaoParams = {
        response_type: "code",
        client_id: "564d95aa68dfb025d4f3726ecaac2764",
        redirect_uri: "http://127.0.0.1:3000/social/kakao",
      };
      const params = new URLSearchParams(kakaoParams).toString();
      return (
        <Box mb="4">
          <HStack my={8}>
            <Divider />
            <Text
              textTransform={"uppercase"}
              color="gray"
              fontSize={"xs"}
              as="b"
            >
              Or
            </Text>
            <Divider />
          </HStack>
          <VStack>
            <Button
              as="a"
              href="https://github.com/login/oauth/authorize?client_id=10136d2489a8c313cbe4&scope=read:user,user:email"
              w="100%"
              leftIcon={<FaGithub />}
            >
              Continue with Github
            </Button>
            <Button
              as={"a"}
              href={`https://kauth.kakao.com/oauth/authorize?${params}`}
              w="100%"
              leftIcon={<FaComment />}
              colorScheme="yellow"
            >
              Continue with Kakao
            </Button>
          </VStack>
        </Box>
      );
    }
    ```

    - `kakoParams`에 필수 요소들을 넣고, 이를 `URLSearchParams`를 사용해 하나의 `string`으로 만든다.

      - `params`를 `href`에 넣을 수 있다.

- `frontend/src/routes/KakoConfirm.tsx`

  ```tsx
  import { Heading, VStack, Text, Spinner, useToast } from "@chakra-ui/react";
  import { useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import { kakaoLogIn } from "../api";
  import { useQueryClient } from "@tanstack/react-query";

  export default function GithubConfirm() {
    const { search } = useLocation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const confirmLogin = async () => {
      const params = new URLSearchParams(search);
      const code = params.get("code");
      if (code) {
        console.log(code);
        return; // code 출력 후 리턴
        const status = await kakaoLogIn(code);
        if (status === 200) {
          toast({
            status: "success",
            title: "Welcome!",
            description: "Happy to have you back!",
          });
          queryClient.refetchQueries({
            queryKey: ["me"],
            exact: true,
          });
          navigate("/");
        }
      }
    };
    useEffect(() => {
      confirmLogin();
    }, []);
    return (
      <VStack justifyContent={"center"} mt={40}>
        <Heading>Processing log in...</Heading>
        <Text>Don't go anywhere.</Text>
        <Spinner size={"lg"} />
      </VStack>
    );
  }
  ```

  > `GithubConfirm.tsx`를 전부 복붙 하고 `function`이름과 `api` 이름만 바꿈

  - `code`만 출력하고 리턴해보면

    - `5_808JTuzyvXaqxi8agzTjqMoaN-X5785j405dSYbpviSFk-bgo7xLRMv8QKPXMXAAABjYlQkWqvm_uHqQwxKA`

      - `code`가 잘 출력된다.

<br>

### Kakao Log In

- 토큰을 받아오자.

  - [kakaologin/rest-api#request-token](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token)

  - `url`을 만들고 `view`를 만들어 서로 연결시킨다.

    - `backend/users/urls.py`

      ```py
      from django.urls import path
      from rest_framework.authtoken.views import obtain_auth_token
      from . import views

      urlpatterns = [
          path("", views.Users.as_view()),
          path("me", views.Me.as_view()),
          path("change-password", views.ChangePassword.as_view()),
          path("log-in", views.LogIn.as_view()),
          path("log-out", views.LogOut.as_view()),
          path("token-login", obtain_auth_token),
          path("jwt-login", views.JWTLogIn.as_view()),
          path("github", views.GithubLogIn.as_view()),
          path("kakao", views.KakaoLogIn.as_view()),  # 추가
          path("@<str:username>", views.PublicUser.as_view()),
          path("@<str:username>/rooms", views.UserRooms.as_view()),
          path("@<str:username>/reviews", views.UserReviews.as_view()),
      ]
      ```

    - `backend/users/views.py`

      ```py
      import jwt
      import requests
      from django.conf import settings

      ...

      class KakaoLogIn(APIView):
          def post(self, request):
              code = request.data.get("code")
              access_token = requests.post(
                  "https://kauth.kakao.com/oauth/token",
                  headers={"Content-Type": "application/x-www-form-urlencoded"},
                  data={
                      "grant_type": "authorization_code",
                      "client_id": "564d95aa68dfb025d4f3726ecaac2764",
                      "redirect_uri": "http://127.0.0.1:3000/social/kakao",
                      "code": code,
                  },
              )
              access_token = access_token.json().get("access_token")
              return Response()
      ```

      - `access_token`을 출력해보면

        ```
        {'access_token': '5vVTAvHjAmw47MLwSb4Uo9aQ4JMm1utx5AUKPXWcAAABjYx3sZH-oZq-Jypvmw', 'token_type': 'bearer', 'refresh_token': '1WPc63s4qnqEWuO7nhpUEkR0wMuAD-GUMrUKPXWcAAABjYx3sY7-oZq-Jypvmw', 'expires_in': 21599, 'scope': 'profile_image profile_nickname', 'refresh_token_expires_in': 5183999}
        ```

        - 받는 것을 확인할 수 있다.

- 사용자의 모든 정보를 받아와 로그인 시키자.

  - [kakaologin/rest-api#req-user-info](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info)

  - `backend/users/views.py`

    ```py
    class KakaoLogIn(APIView):
        def post(self, request):
            try:
                code = request.data.get("code")
                access_token = requests.post(
                    "https://kauth.kakao.com/oauth/token",
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    data={
                        "grant_type": "authorization_code",
                        "client_id": "564d95aa68dfb025d4f3726ecaac2764",
                        "redirect_uri": "http://127.0.0.1:3000/social/kakao",
                        "code": code,
                    },
                )
                access_token = access_token.json().get("access_token")
                user_data = requests.get(
                    "https://kapi.kakao.com/v2/user/me",
                    headers={"Authorization": f"Bearer ${access_token}"},
                )
                user_data = user_data.json()
                kakao_account = user_data.get("kakao_account")
                profile = kakao_account.get("profile")
                try:
                    user = User.objects.get(email=kakao_account.get("email"))
                    login(request, user)
                    return Response(status=status.HTTP_200_OK)
                except User.DoesNotExist:
                    user = User.objects.create(
                        email=kakao_account.get("email"),
                        username=profile.get("nickname"),
                        name=profile.get("nickname"),
                        avatar=profile.get("profile_image_url"),
                    )
                    user.set_unusable_password()
                    user.save()
                    login(request, user)
                    return Response(status=status.HTTP_200_OK)
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)
    ```

    - `GitHub` 로그인처럼 `user`의 `email`을 확인해 로그인 시키거나 새로운 `user`를 만든다.

      > **`GitHub` 이메일과 `Kakao` 이메일이 같으면, 나중에 로그인할 때 둘 중에 먼저 계정을 만든 쪽으로 로그인 된다.(두 이메일을 다르게 해야 함)**

    <details>
    <summary>user_data</summary>
    <markdown="1">
    <div>

    - `user_data`를 받아와서 출력해보면

      ```py
      > print(user_data)
      {'id': 3335478704,
      'connected_at': '2024-02-09T06:04:14Z',
      'properties': {
        'nickname': '김정목',
        'profile_image': 'http://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_640x640.jpg',
        'thumbnail_image': 'http://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_110x110.jpg'
        },
        'kakao_account': {
          'profile_nickname_needs_agreement': False,
          'profile_image_needs_agreement': False,
          'profile':
            {'nickname': '김정목',
            'thumbnail_image_url': 'http://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_110x110.jpg',
            'profile_image_url': 'http://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_640x640.jpg',
            'is_default_image': True
            },
            'has_email': True,
            'email_needs_agreement': False,
            'is_email_valid': True,
            'is_email_verified': True,
            'email': 'm0_w_0m@naver.com'
        }
      }
      ```

      - `user`의 모든 정보를 받아올 수 있다.

        > 동의항목에서 카카오계정(이메일) 상태를 **필수 동의**로 하지 않으면 이메일을 받아올 수 없음

        > `user`가 이메일 정보 수집에 동의하지 않아도 받아올 수 없음

      - 모든 정보를 받거나 이메일 정보만 따로 받을 수도 있다.

        ![Alt text](./images/kakao_req_user_info.png)

    </div>
    </details>

    ![Alt text](./videos/github_kakao_login.gif)

<br>

### Log In Form

- `username`과 `password`를 이용한 로그인을 구현해보자.

  - `frontend/src/components/LoginModal.tsx`

    ```tsx
    import {
      Box,
      Button,
      Input,
      InputGroup,
      InputLeftElement,
      Modal,
      ModalBody,
      ModalCloseButton,
      ModalContent,
      ModalHeader,
      ModalOverlay,
      VStack,
    } from "@chakra-ui/react";
    import { FaUserNinja, FaLock } from "react-icons/fa";
    import SocialLogin from "./SocialLogin";
    import { useState } from "react";

    interface LoginModalProps {
      isOpen: boolean;
      onClose: () => void;
    }

    export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
      const [username, setUsername] = useState("");
      const [password, setPassword] = useState("");
      const onChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget;
        if (name === "username") {
          setUsername(value);
        } else if (name === "password") {
          setPassword(value);
        }
      };
      const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(username, password);
      };
      return (
        <Modal onClose={onClose} isOpen={isOpen}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Log in</ModalHeader>
            <ModalCloseButton />
            <ModalBody as="form" onSubmit={onSubmit as any}>
              <VStack>
                <InputGroup>
                  <InputLeftElement
                    children={
                      <Box color={"gray.500"}>
                        <FaUserNinja />
                      </Box>
                    }
                  />
                  <Input
                    required
                    name="username"
                    onChange={onChange}
                    value={username}
                    type="password"
                    variant={"filled"}
                    placeholder="username"
                  />
                </InputGroup>
                <InputGroup>
                  <InputLeftElement
                    children={
                      <Box color={"gray.500"}>
                        <FaLock />
                      </Box>
                    }
                  />
                  <Input
                    required
                    name="password"
                    onChange={onChange}
                    value={password}
                    variant={"filled"}
                    placeholder="password"
                  />
                </InputGroup>
              </VStack>
              <Button type="submit" mt={"4"} colorScheme="red" w="100%">
                Log in
              </Button>
              <SocialLogin />
            </ModalBody>
          </ModalContent>
        </Modal>
      );
    }
    ```

    - 위와 같이 `reactJS`로만 코드를 작성하면 `username`, `password`에 대해 `useState`를 만들어야 하고, 각각의 `error`에 대한 `useState`도 만들어야 한다.

      - 또한 그 모든 것들은 `validate` 되어야 하고, 모든 `onChange` 함수에 대해 `validation`도 직접 해야 한다.

<br>

### React Hook Form

- `React Hook Form` 라이브러리를 사용해서 `username`, `password`를 받아오고 확인해보자.

  - `frontend`에 `react-hook-form`을 설치한다.

    - `npm i react-hook-form`

- `frontend/src/components/LoginModal.tsx`

  ```tsx
  import { useForm } from "react-hook-form"; // import
  import {
    Box,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    VStack,
    Text,
  } from "@chakra-ui/react";
  import { FaUserNinja, FaLock } from "react-icons/fa";
  import SocialLogin from "./SocialLogin";
  import { useState } from "react";

  interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  interface IForm {
    username: string;
    password: string;
  }

  export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<IForm>();
    const onSubmit = (data: IForm) => {
      console.log(data);
    };
    return (
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log in</ModalHeader>
          <ModalCloseButton />
          <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack>
              <InputGroup>
                <InputLeftElement
                  children={
                    <Box color={"gray.500"}>
                      <FaUserNinja />
                    </Box>
                  }
                />
                <Input
                  isInvalid={Boolean(errors.username?.message)}
                  {...register("username", {
                    required: "Please write a username",
                  })}
                  variant={"filled"}
                  placeholder="Username"
                />
              </InputGroup>
              <InputGroup>
                <InputLeftElement
                  children={
                    <Box color={"gray.500"}>
                      <FaLock />
                    </Box>
                  }
                />
                <Input
                  isInvalid={Boolean(errors.password?.message)}
                  {...register("password", { required: true })}
                  type="password"
                  variant={"filled"}
                  placeholder="Password"
                />
              </InputGroup>
            </VStack>
            <Button type="submit" mt={"4"} colorScheme="red" w="100%">
              Log in
            </Button>
            <SocialLogin />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  ```

  <details>
  <summary>상세내용</summary>
  <markdown="1">
  <div>

    <details>
    <summary>register</summary>
    <markdown="1">
    <div>

  - `register`

    - `form`에 `input`을 등록하는데 사용한다.

      ```tsx
      import { useForm } from "react-hook-form";
      ...

      export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
        const { register } = useForm();
        return (
                  <InputGroup>
                    <Input
                      required
                      {...register("username")}
                      variant={"filled"}
                      placeholder="Username"
                    />
                  </InputGroup>
                  <InputGroup>
                    ...
                    <Input
                      required
                      {...register("password")}
                      type="password"
                      variant={"filled"}
                      placeholder="Password"
                    />
                  </InputGroup>
        );
      }
      ```

      - `register`를 출력해보면

        ```
        >>> console.log("asdf")
        {name: 'asdf', onChange: ƒ, onBlur: ƒ, ref: ƒ}
        name: "asdf"
        onBlur: async event => {…}
        onChange: async event => {…}
        ref: ref => {…}
        [[Prototype]]: Object
        ```

        - `name`, `onBlur`, `onChange`, `ref`가 있다.

          - `...` 연산자로 네 가지를 `prop`처럼 넣어준다.

            ```tsx
            <InputGroup>
              <Input
                required
                name="password"
                onBlur={onBlur}
                onChange={onChange}
                ref={ref}
                type="password"
                variant={"filled"}
                placeholder="Password"
              >
            </InputGroup>
            ```

  </div>
  </details>

  <details>
  <summary>handleSubmit</summary>
  <markdown="1">
  <div>

  - `handleSubmit`은 `data`를 `validate` 하는 함수다.

    - 또한, 기본적으로 `submit` 동작의 `default`을 막아주는 `preventDefault`를 호출한다.

      ```tsx
      import { useForm } from "react-hook-form";
      ...

      interface IForm {
        username: string;
        password: string;
      }

      export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
        const { register, handleSubmit } = useForm<IForm>();
        const onSubmit = (data: IForm) => {
          console.log(data);
        };
        return (
          <Modal onClose={onClose} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Log in</ModalHeader>
              <ModalCloseButton />
              <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
          ...
        );
      }

      ```

      - `onSubmit` 함수와 함께 `handleSubmit`을 호출한다.

        - `onSubmit` 함수는 `form`에서 `data`를 받아오는데, 이는 `username`과 `password`이고 `interface`로 `type`을 설명해주어야 한다.

  </div>
  </details>

  <details>
  <summary>validate</summary>
  <markdown="1">
  <div>

  - `html` 상에서 `reqiured`를 삭제하고 로그인 버튼을 누를 수 있기 때문에 `javascript`, `React Hook Form`으로 `form`을 `validate` 하는 것이 필요하다.

    ```tsx
    import { useForm } from "react-hook-form";
    ...

    interface IForm {
      username: string;
      password: string;
    }

    export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
      const { register, handleSubmit } = useForm<IForm>();
      const onSubmit = (data: IForm) => {
        console.log(data);
      };
      return (
        ...
                <InputGroup>
                  <Input
                    required
                    {...register("username", {required: true},)}
                    variant={"filled"}
                    placeholder="Username"
                  />
                </InputGroup>
                <InputGroup>
                  ...
                  <Input
                    required
                    {...register("password", {required: true},)}
                    type="password"
                    variant={"filled"}
                    placeholder="Password"
                  />
                </InputGroup>
        ...
      );
    }
    ```

    - `{...register("username", {required: true},)}`처럼 `required`를 추가할 수도 있고, `true` 대신에 메세지를 넣을 수도 있다.

      ```tsx
      <InputGroup>
        <Input
          required
          {...register("username", { required: "Please write a userame" })}
          variant={"filled"}
          placeholder="Username"
        />
      </InputGroup>
      ```

    - `formState`에서 `errors`를 가지고 올 수 있다.

      ```tsx
      import { useForm } from "react-hook-form";
      ...

      interface IForm {
        username: string;
        password: string;
      }

      export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm<IForm>();
        const onSubmit = (data: IForm) => {
          console.log(data);
        };
        return (
          ...
                  <InputGroup>
                    <Input
                      required
                      {...register("username", {required: true},)}
                      variant={"filled"}
                      placeholder="Username"
                    />
                  </InputGroup>
                  <InputGroup>
                    ...
                    <Input
                      required
                      {...register("password", {required: true},)}
                      type="password"
                      variant={"filled"}
                      placeholder="Password"
                    />
                  </InputGroup>
          ...
        );
      }
      ```

      - `isInvalid prop`을 사용해 `username errors object`에 메세지가 존재한다면 그 `input`은 `invalid`한 것을 검증할 수 있다.

  </div>
  </details>

  </div>
  </details>

<br>

### useMutation

- `user`가 `input`에 입력한 `username`과 `password`를 받아와 로그인을 해보자.

  > `API`로 어떤 데이터를 보내는 것을 `mutation`이라고 한다.

- `Home.tsx`에서 `useQuery`를 사용해 `API`로부터 데이터를 받아왔다.

  - `frontend/src/routes/Home.tsx`

    ```tsx
    ...
    import { getRooms } from "../api";
    import { IRoomList } from "../types";

    export default function Home() {
      const { isLoading, data } = useQuery<IRoomList[]>({
        queryKey: ["rooms"],
        queryFn: getRooms,
      });
      ...
    }
    ```

    - `getRooms` 함수는 `useQuery`에 의해 지배받고 있다.

      - `useQuery`는 `getRooms` 함수를 지켜보고 있다가 함수가 로딩 중이거나, 데이터를 리턴하거나, 에러가 발생하면 `getRooms` 함수를 가지고 유저에게 알려준다.

- `useMutation`은 `useQuery`와 같이 `mutation` 함수를 가지고 로딩 중이거나, 에러가 있거나, `mutation`의 결과가 있으면 유저에게 알려준다.

  - 현재 로그아웃에는 `mutation`에 대한 구조가 전혀 없다.

    - `frontend/src/components/Header.tsx`

      ```tsx
      export default function Header() {
        ...
        const onLogOut = async () => {
          const toastId = toast({
            title: "Login out...",
            description: "Sad to see you go...",
            status: "loading",
            position: "bottom-right",
          });
          await logOut();
          queryClient.refetchQueries({
            queryKey: ["me"],
            exact: true,
          });
          toast.update(toastId, {
            status: "success",
            title: "Done!",
            description: "See you later!",
            duration: 2000,
          });
        };
      ```

      - 에러가 발생한다면 어떻게 되는지 알 수 없다.

      > `DB`에서 데이터를 `query`할 때 구조가 있는 것처럼, `DB`에서 `mutation`을 하고 싶다면 구조가 필요하다.

- `useMutation`을 사용하기 위해 함수를 만든다.

  - `frontend/src/api.ts`

    ```ts
    ...

    export interface IUsernameLoginVariables {
      username: string;
      password: string;
    }
    export interface IUsernameLoginSuccess {
      ok: string;
    }
    export interface IUsernameLoginError {
      error: string;
    }

    export const usernameLogIn = ({
      username,
      password,
    }: IUsernameLoginVariables) =>
      instance
        .post(
          `/users/log-in`,
          { username, password },
          {
            headers: {
              "X-CSRFToken": Cookie.get("csrftoken") || "",
            },
          }
        )
        .then((response) => response.data);
    ```

    <details>
    <summary>상세내용</summary>
    <markdown="1">
    <div>

    - `mutation` 함수는 하나의 `argument`를 가지지 않고 `object`를 가져오는 새로운 패턴을 가진다.

      > `username`, `password`으로 로그인 함

      - 이 `obejct`의 `type`을 `interface`에 작성하고 지정해준다.

        ```ts
        export interface IUsernameLoginVariables {
          username: string;
          password: string;
        }

        ...

        export const usernameLogIn = ({
          username,
          password,
        }: IUsernameLoginVariables
        ```

    - `post` 요청을 `/users/log-in`으로 보낸다.

      - `status` 대신 `data`를 보내는데, 이때의 `data`는 `ok`나 `error`를 받는다.

        - `backend/users/views.py`

          ```py
          ...

          class LogIn(APIView):
              def post(self, request):
                  ...
                  if user:
                      login(request, user)
                      return Response({"ok": "Welcome!"})
                  else:
                      return Response({"error": "wrong password"})

          ...
          ```

        - 이를 위한 `type`도 지정해준다.

          ```ts
          export interface IUsernameLoginSuccess {
            ok: string;
          }

          export interface IUsernameLoginError {
            error: string;
          }
          ```

    </div>
    </details>

- `useMutation hook`을 써보자.

  - `frontent/src/components/LoginModal.tsx`

    ```tsx
    ...
    import { useMutation, useQueryClient } from "@tanstack/react-query";
    import {
      IUsernameLoginError,
      IUsernameLoginSuccess,
      IUsernameLoginVariables,
      usernameLogIn,
    } from "../api";

    interface LoginModalProps {
      isOpen: boolean;
      onClose: () => void;
    }

    interface IForm {
      username: string;
      password: string;
    }

    export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<IForm>();
      const toast = useToast();
      const queryClient = useQueryClient();
      const mutation = useMutation({
        mutationFn: usernameLogIn,
        onMutate: (data) => {
          console.log("mutation starting");
        },
        onSuccess() {
          toast({
            title: "welcome back!",
            status: "success",
          });
          onClose();
          queryClient.refetchQueries({
            queryKey: ["me"],
          });
        },
        onError(error) {
          console.log("mutation has an error");
        },
      });
      const onSubmit = ({ username, password }: IForm) => {
        mutation.mutate({ username, password });
      };
      return (
        <Modal onClose={onClose} isOpen={isOpen}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Log in</ModalHeader>
            <ModalCloseButton />
            <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
              ...
              <Button
                isLoading={mutation.status === "pending"}
                type="submit"
                mt={4}
                colorScheme={"red"}
                w="100%"
              >
                Log in
              </Button>
              <SocialLogin />
            </ModalBody>
          </ModalContent>
        </Modal>
      );
    }
    ```

    - [Migrating to TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)

      > `TanStack Query` v4의 `useMutation`이 문법이 달라졌음

<details>
<summary>useMutation 사용 방법</summary>
<markdown="1">
<div>

- `useMutation`의 `generics`

  ```tsx
    const mutation = useMutation({
      IUsernameLoginSuccess,
      IUsernameLoginError,
      IUsernameLoginVariables,
      mutationFn: usernameLogIn,
      onMutate: (data) => {
        console.log("mutation statring");
      },
      ...
    });
  ```

  - `useMutation`은 4개의 `generics`를 받을 수 있다.

    - `TData`, `TError`, `TVariables`, `TContext`

      - 앞에 세 가지를 `IUsernameLoginSuccess`, `IUsernameLoginError`, `IUsernameLoginVariables`로 받을 수 있지만 필수는 아니다.

- `useMutation`의 함수들

  ```tsx
  const mutation = useMutation({
    mutationFn: usernameLogIn,
    onMutate: (data) => {
      console.log("mutation starting");
    },
    onSuccess() {
      toast({
        title: "welcome back!",
        status: "success",
      });
      onClose();
      queryClient.refetchQueries({
        queryKey: ["me"],
      });
    },
    onError(error) {
      console.log("mutation has an error");
    },
  });
  ```

  - `onMutate`: `mutation`이 시작하면 호출된다.

    > `data`를 받을 수 있음

  - `onSuccess`: `mutation`이 성공하면 호출된다.

    > 메세지를 띄우고 `modal`을 닫음

    > `queryClient.refetchQueries`로 홈페이지로 리다이렉트 할 수 있음

  - `onError`: `mutation`에 에러가 있으면 호출된다.

    > `error`를 받을 수 있음

- `mutation` 자체 알림

  ```tsx
  <Button
    isLoading={mutation.status === "pending"}
    type="submit"
    mt={4}
    colorScheme={"red"}
    w="100%"
  >
  ```

  - `isLoading prop`을 `mutation`의 `status`에 따라 활성화하고 비활성화할 수 있다.

    > `pending`은 `mutation`이 작동하고 있다는 뜻

- `mutation` 실행

  ```tsx
  const onSubmit = ({ username, password }: IForm) => {
    mutation.mutate({ username, password });
  };
  ```

  - `user`가 `form`을 `submit`하면, `mutation.mutate` 함수를 호출해 `mutation`을 실행한다.

</div>
</details>

- 로그인 확인

  ![Alt text](./videos/usernamelogin.gif)

<br>

### Recap

- `username`과 `password`로 로그인을 한 후, 로그아웃을 하면 작성했던 `form`이 그대로 남아있다.

  - `reset`으로 이를 초기화 시켜주자.

    - `frontend/src/components/LoginModal.tsx`

      ```tsx
      ...

      export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
        const {
          register,
          handleSubmit,
          formState: { errors },
          reset,  // import
        } = useForm<IForm>();
        const toast = useToast();
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: usernameLogIn,
          onMutate: (data) => {
            console.log("mutation starting");
          },
          onSuccess() {
            toast({
              title: "welcome back!",
              status: "success",
            });
            onClose();
            reset();  // reset
            queryClient.refetchQueries({
              queryKey: ["me"],
            });
          },
        });
        const onSubmit = ({ username, password }: IForm) => {
          mutation.mutate({ username, password });
        };
        return (
          <Modal onClose={onClose} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Log in</ModalHeader>
              <ModalCloseButton />
              <ModalBody as="form" onSubmit={handleSubmit(onSubmit)}>
                ...
                {mutation.isError ? (
                  <Text color={"red.500"} textAlign={"center"} fontSize={"sm"}>
                    Username or Password are wrong
                  </Text>
                ) : null}
                <Button
                  isLoading={mutation.status === "pending"}
                  type="submit"
                  mt={4}
                  colorScheme={"red"}
                  w="100%"
                >
                  Log in
                </Button>
                <SocialLogin />
              </ModalBody>
            </ModalContent>
          </Modal>
        );
      }
      ```

      - `onError`에서 에러가 발생했을 때 `toast`를 띄울 수도 있지만, `Button`에서 삼항 연산자를 사용해 `text`를 생성할 수도 있다.

- `logout method`를 리팩토링해서 `useMutation`을 사용해보자.

  - `frontend/src/components/Header.tsx`

    ```tsx
    ...
    import { useMutation, useQueryClient } from "@tanstack/react-query";  // import
    import { Link } from "react-router-dom";
    import { useRef } from "react"; // import

    export default function Header() {
      ...

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
          if (toastId.current) {  // toastId.current가 존재하는지 확인
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
        ...
      );
    }
    ```

    - `onMutate`와 `onSuccess`가 하나의 `toastId`를 공유하도록 해야 한다.

      - `react`의 `useRef`를 써서 `toastId`라는 `reference`를 만들고, `type`을 지정해준다.

        ```tsx
        const toastId = useRef<ToastId>();
        ```

        > `useRef`는 `state`에 넣고 싶지 않은 `value`를 저장할 때 사용함

        > 컴포넌트에 렌더링이 여러 번 발생해도 `toastId`는 지속됨

<br>

### Code Challenge

```
sign up form [x]
kakaoConfirm [x]
GithubConfirm [x]
```

---

## UPLOAD ROOM

### Protected Pages

- `user`가 `form`을 업로드할 때 사용할 화면을 만들어보자.

  - `user`가 `host`일 때 업로드가 가능하므로 이를 확인해야 한다.

    - 업로드할 `route`를 만들고 `router`와 `Header`에 추가한다.

      - `frontend/src/routes/UploadRoom.tsx`

        ```tsx
        export default function UploadRoom() {
          return <h1>upload room</h1>;
        }
        ```

      - `fronted/src/router.tsx`

        ```tsx
        ...
        import UploadRoom from "./routes/UploadRoom"; // import
        const router = createBrowserRouter([
          {
            path: "/",
            element: <Root />,
            errorElement: <NotFound />,
            children: [
              {
                path: "",
                element: <Home />,
              },
              {
                path: "rooms/upload",
                element: <UploadRoom />,
              },
              {
                path: "rooms/:roomPk",
                element: <RoomDetail />,
              },
              ...
            ],
          },
        ]);

        export default router;
        ```

        - `rooms/:roomPk`보다 아래에 `rooms/upload path`를 만들면 `rooms/` 이후에 모든 `url`을 `roomPk`로 알기 때문에 `rooms/upload`로 가도 `rooms/:roomPk`로 이동한다.

          - 따라서 제일 위에 `rooms/upload path`를 적는다.

      - `frontend/src/components/Header.tsx`

        ```tsx
        ...

        export default function Header() {
          ...
          return (
            <Stack
              ...
                {!userLoading ? (
                  !isLoggedIn ? (
                    ...
                  ) : (
                    <Menu>
                      ...
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
              ...
            </Stack>
          );
        }
        ```

        - `Header`에서 `upload` 메뉴 아이템을 추가하는데, `host`일 때만 보이게 한다.

- 현재 `UploadRoom`은 보안 설정이 필요하다.

  - `frontend/src/components/ProtectedPage.tsx`

    ```tsx
    import useUser from "../lib/useUser";
    import { useEffect } from "react";
    import { useNavigate } from "react-router-dom";

    interface IProtectedPageProps {
      children: React.ReactNode;
    }

    export default function ProtectedPage({ children }: IProtectedPageProps) {
      const { isLoggedIn, userLoading } = useUser();
      const navigate = useNavigate();
      useEffect(() => {
        if (!userLoading) {
          if (!isLoggedIn) {
            navigate("/");
          }
        }
      }, [userLoading, isLoggedIn, navigate]);
      return <>{children}</>;
    }
    ```

    - `useUser hook`을 통해 `user` 정보를 받아와 `userLoading`과 `isLoggedIn`으로 보안을 검사할 수 있다.

      > `useUser hook`은 `useQuery`를 불러오고 있는데, 이미 `useHeader`나 `header`에서 실행되어 캐시에 저장되어 있는 정보를 받을 수 있다.

  - `UploadRoom.tsx`에서 감싸주면 된다.

    - `frontend/src/routes/UploadRoom.tsx`

      ```tsx
      import ProtectedPage from "../components/ProtectedPage";

      export default function UploadRoom() {
        return (
          <ProtectedPage>
            <h1>upload room</h1>;
          </ProtectedPage>
        );
      }
      ```

- `host`만 접근할 수 있는 페이지를 만들어야 한다.

  - `frontend/src/components/HostOnlyPage.tsx`

    ```tsx
    import useUser from "../lib/useUser";
    import { useEffect } from "react";
    import { useNavigate } from "react-router-dom";

    interface IHostOnlyPageProps {
      children: React.ReactNode;
    }

    export default function HostOnlyPage({ children }: IHostOnlyPageProps) {
      const { user, userLoading } = useUser();
      const navigate = useNavigate();
      useEffect(() => {
        if (!userLoading) {
          if (!user?.is_host) {
            navigate("/");
          }
        }
      }, [userLoading, user, navigate]);
      return <>{children}</>;
    }
    ```

    - `ProtectedPage`와 유사하게 `userLoading`과 `user` 정보를 받아와 `user.is_host`를 검사할 수 있다.

    - `UploadRoom`에서 감싸준다.

      - `frontend/src/routes/UploadRoom.tsx`

        ```tsx
        import HostOnlyPage from "../components/HostOnlyPage";
        import ProtectedPage from "../components/ProtectedPage";

        export default function UploadRoom() {
          return (
            <ProtectedPage>
              <HostOnlyPage>
                <h1>upload room</h1>;
              </HostOnlyPage>
            </ProtectedPage>
          );
        }
        ```

- `HostOnlyPage`를 `component` 대신 `hook`으로 만들어서 사용할 수도 있다.

  - `frontend/src/components/HostOnlyPage.tsx`

    ```tsx
    import useUser from "../lib/useUser";
    import { useEffect } from "react";
    import { useNavigate } from "react-router-dom";

    export default function useHostOnlyPage() {
      const { user, userLoading } = useUser();
      const navigate = useNavigate();
      useEffect(() => {
        if (!userLoading) {
          if (!user?.is_host) {
            navigate("/");
          }
        }
      }, [userLoading, user, navigate]);
      return;
    }
    ```

  - `frontend/src/routes/UploadRoom.tsx`

    ```tsx
    import useHostOnlyPage from "../components/HostOnlyPage";
    import ProtectedPage from "../components/ProtectedPage";

    export default function UploadRoom() {
      useHostOnlyPage();
      return (
        <ProtectedPage>
          <h1>upload room</h1>;
        </ProtectedPage>
      );
    }
    ```

<br>

### Upload Form

- `chakra`를 이용해 `room`을 업로드하기 위한 `form`을 만들어보자.

  - `frontend/src/routes/UploadRoom.tsx`

    ```tsx
    import {
      Box,
      Checkbox,
      Container,
      FormControl,
      FormHelperText,
      FormLabel,
      HStack,
      Heading,
      Input,
      InputGroup,
      InputLeftAddon,
      Radio,
      RadioGroup,
      Textarea,
      VStack,
    } from "@chakra-ui/react";
    import useHostOnlyPage from "../components/HostOnlyPage";
    import ProtectedPage from "../components/ProtectedPage";
    import { FaBed, FaDollarSign, FaToilet } from "react-icons/fa";

    export default function UploadRoom() {
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
              <VStack spacing={5} as={"form"} mt={5}>
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
                  <RadioGroup defaultValue="Itachi">
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
              </VStack>
            </Container>
          </Box>
        </ProtectedPage>
      );
    }
    ```

    ![Alt text](./images/uploadroom.png)

<br>

### Dynamic Form

- `user`에게 `amenity`와 `category`를 선택할 수 있게 하려면 `DB`로부터 각각의 항목들을 불러와야 한다.

  - `frontend/src/api.ts`

    ```ts
    ...

    export const getAmenities = () =>
      instance.get(`rooms/amenities`).then((response) => response.data);

    export const getCategories = () =>
      instance.get(`categories`).then((response) => response.data);
    ```

    - `rooms/amenities`와 `categories`에 `get` 요청을 하여 데이터를 받는다.

- `category`에는 `room`과 `experience`가 있는데,

  - `backend/categories/views.py`

    ```py
    from rest_framework.viewsets import ModelViewSet
    from .models import Category
    from .serializers import CategorySerializer


    class CategoryViewSet(ModelViewSet):
        serializer_class = CategorySerializer
        # queryset = Category.objects.all()
        queryset = Category.objects.filter(
            kind=Category.CategoryKindChoices.ROOMS,
        )
    ```

    - 현재 `queryset`은 모든 `category`를 주기 때문에, 우선 `all` 대신 `filter`를 사용해 `room category`만 받아온다.

  - `user`가 선택한 `category`와 `amenity`의 `pk`를 받아야 하므로, 각각의 `serializer`에서 `pk`를 추가한다.

    - `backend/categories/serializers.py`

      ```py
      from rest_framework import serializers
      from .models import Category


      class CategorySerializer(serializers.ModelSerializer):
          class Meta:
              model = Category
              fields = (
                  "pk",   # 추가
                  "name",
                  "kind",
              )
      ```

    - `backend/rooms/serializers.py`

      ```py
      ...


      class AmenitySerializer(ModelSerializer):
          class Meta:
              model = Amenity
              fields = (
                  "pk",   # 추가
                  "name",
                  "description",
              )


      class RoomDetailSerializer(ModelSerializer):
          ...


      class RoomListSerializer(ModelSerializer):
          ...
      ```

  - `types.d.ts`

    ```ts
    ...

    export interface IAmenity {
      pk: number;   // 추가
      name: string;
      description: string;
    }

    export interface ICategory {  // 따로 뺌
      pk: number;
      name: string;
      kind: string;
    }

    export interface IRoomDetail extends IRoomList {
      created_at: string;
      updated_at: string;
      rooms: number;
      toilets: number;
      description: string;
      address: string;
      pet_friendly: true;
      kind: string;
      is_owner: boolean;
      is_liked: boolean;
      category: ICategory;
      owner: IRoomOwner;
      amenities: IAmenity[];
    }

    ...
    ```

    - `category type`을 따로 빼고, `IAmenity`와 `ICategory`에 `pk`를 추가한다.

- `frontend/src/routes/UploadRoom.tsx`

  ```tsx
  ...
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
        ...
          <Container>
            <Heading textAlign={"center"}>Upload Room</Heading>
            <VStack spacing={10} as={"form"} mt={5}>
              ...
              <FormControl>
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
  ```

  - `useQuery`를 이용해 `category`와 `amenity`에 대한 정보를 받을 수 있다.

    ![Alt text](./images/category_amenities.png)
