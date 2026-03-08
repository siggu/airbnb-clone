import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./components/Root";
import NotFound from "./routes/NotFound";

const Home = lazy(() => import("./routes/Home"));
const Experiences = lazy(() => import("./routes/Experiences"));
const RoomDetail = lazy(() => import("./routes/RoomDetail"));
const GithubConfirm = lazy(() => import("./routes/GithubConfirm"));
const KakaoConfirm = lazy(() => import("./routes/KakaoConfirm"));
const UploadRoom = lazy(() => import("./routes/UploadRoom"));
const UploadPhotos = lazy(() => import("./routes/UploadPhotos"));
const Wishlists = lazy(() => import("./routes/Wishlists"));
const Bookings = lazy(() => import("./routes/Bookings"));
const ExperienceDetail = lazy(() => import("./routes/ExperienceDetail"));
const UploadExperience = lazy(() => import("./routes/UploadExperience"));
const UploadExperiencePhotos = lazy(() => import("./routes/UploadExperiencePhotos"));
const EditRoom = lazy(() => import("./routes/EditRoom"));
const EditExperience = lazy(() => import("./routes/EditExperience"));
const UserProfile = lazy(() => import("./routes/UserProfile"));
const ChangePassword = lazy(() => import("./routes/ChangePassword"));

const wrap = (element: JSX.Element) => <Suspense fallback={null}>{element}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: wrap(<Home />),
      },
      {
        path: "experiences",
        element: wrap(<Experiences />),
      },
      {
        path: "experiences/upload",
        element: wrap(<UploadExperience />),
      },
      {
        path: "experiences/:experiencePk",
        element: wrap(<ExperienceDetail />),
      },
      {
        path: "experiences/:experiencePk/photos",
        element: wrap(<UploadExperiencePhotos />),
      },
      {
        path: "experiences/:experiencePk/edit",
        element: wrap(<EditExperience />),
      },
      {
        path: "rooms/upload",
        element: wrap(<UploadRoom />),
      },
      {
        path: "rooms/:roomPk",
        element: wrap(<RoomDetail />),
      },
      {
        path: "rooms/:roomPk/edit",
        element: wrap(<EditRoom />),
      },
      {
        path: "rooms/:roomPk/photos",
        element: wrap(<UploadPhotos />),
      },
      {
        path: "wishlists",
        element: wrap(<Wishlists />),
      },
      {
        path: "bookings",
        element: wrap(<Bookings />),
      },
      {
        path: "users/change-password",
        element: wrap(<ChangePassword />),
      },
      {
        path: "users/:username",
        element: wrap(<UserProfile />),
      },
      {
        path: "social",
        children: [
          {
            path: "github",
            element: wrap(<GithubConfirm />),
          },
          {
            path: "kakao",
            element: wrap(<KakaoConfirm />),
          },
        ],
      },
    ],
  },
]);

export default router;
