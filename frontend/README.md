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
