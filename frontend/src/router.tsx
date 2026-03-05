import { createBrowserRouter } from "react-router-dom";
import Root from "./components/Root";
import Home from "./routes/Home";
import Experiences from "./routes/Experiences";
import NotFound from "./routes/NotFound";
import RoomDetail from "./routes/RoomDetail";
import GithubConfirm from "./routes/GithubConfirm";
import KakaoConfirm from "./routes/KakaoConfirm";
import UploadRoom from "./routes/UploadRoom";
import UploadPhotos from "./routes/UploadPhotos";
import Wishlists from "./routes/Wishlists";
import Bookings from "./routes/Bookings";
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
        path: "experiences",
        element: <Experiences />,
      },
      {
        path: "rooms/upload",
        element: <UploadRoom />,
      },
      {
        path: "rooms/:roomPk",
        element: <RoomDetail />,
      },
      {
        path: "rooms/:roomPk/photos",
        element: <UploadPhotos />,
      },
      {
        path: "wishlists",
        element: <Wishlists />,
      },
      {
        path: "bookings",
        element: <Bookings />,
      },
      {
        path: "social",
        children: [
          {
            path: "github",
            element: <GithubConfirm />,
          },
          {
            path: "kakao",
            element: <KakaoConfirm />,
          },
        ],
      },
    ],
  },
]);

export default router;
