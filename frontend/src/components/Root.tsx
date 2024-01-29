import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <h1>
      i'm root
      <Outlet />
    </h1>
  );
}
