import Cookie from "js-cookie";
import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";

const instance = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1/",
  withCredentials: true,
});

export const getRooms = () =>
  instance.get("rooms/").then((response) => response.data);

export const getRoom = ({ queryKey }: QueryFunctionContext) => {
  const [, roomPk] = queryKey;
  return instance.get(`rooms/${roomPk}`).then((response) => response.data);
};

export const getRoomReviews = ({ queryKey }: QueryFunctionContext) => {
  const [, roomPk] = queryKey;
  return instance
    .get(`rooms/${roomPk}/reviews`)
    .then((response) => response.data);
};

export const getMe = () =>
  instance.get(`users/me`).then((response) => response.data);

export const logOut = () =>
  instance
    .post(`users/log-out`, null, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
      },
    })
    .then((response) => response.data);

export const githubLogIn = (code: string | null) =>
  instance
    .post(
      `users/github`,
      { code },
      {
        headers: {
          "X-CSRFToken": Cookie.get("csrftoken") || "",
        },
      }
    )
    .then((response) => response.status);

export const kakaoLogIn = (code: string | null) =>
  instance
    .post(
      `users/kakao`,
      { code },
      {
        headers: {
          "X-CSRFToken": Cookie.get("csrftoken") || "",
        },
      }
    )
    .then((response) => response.status);

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
      `users/log-in`,
      { username, password },
      {
        headers: {
          "X-CSRFToken": Cookie.get("csrftoken") || "",
        },
      }
    )
    .then((response) => response.data);

export interface ISignUpVariables {
  name: string;
  email: string;
  username: string;
  password: string;
}

export const signUp = ({ name, email, username, password }: ISignUpVariables) =>
  instance
    .post(
      `users/sign-up`,
      { name, email, username, password },
      {
        headers: {
          "X-CSRFToken": Cookie.get("csrftoken") || "",
        },
      }
    )
    .then((response) => response.data);

export const getExperiences = () =>
  instance.get("experiences/").then((response) => response.data);

export const getExperience = ({ queryKey }: QueryFunctionContext) => {
  const [, experiencePk] = queryKey;
  return instance.get(`experiences/${experiencePk}/`).then((r) => r.data);
};

export const uploadPhoto = (roomPk: string, file: File, description: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description);
  return instance
    .post(`rooms/${roomPk}/photos`, formData, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
};

export interface ICreateBookingVariables {
  check_in: string;
  check_out: string;
  guests: number;
}

export const createBooking = (roomPk: string, variables: ICreateBookingVariables) =>
  instance
    .post(`rooms/${roomPk}/bookings`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((response) => response.data);

export interface ICreateReviewVariables {
  payload: string;
  rating: number;
}

export const createReview = (roomPk: string, variables: ICreateReviewVariables) =>
  instance
    .post(`rooms/${roomPk}/reviews`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((response) => response.data);

export const getWishlists = () =>
  instance.get("wishlists/").then((r) => r.data);

export const getBookings = () =>
  instance.get("bookings/").then((r) => r.data);

export const createWishlist = (name: string) =>
  instance
    .post(
      "wishlists/",
      { name },
      { headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" } }
    )
    .then((r) => r.data);

export const toggleWishlistRoom = (wishlistPk: number, roomPk: number) =>
  instance
    .put(`wishlists/${wishlistPk}/rooms/${roomPk}`, null, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.data);

export const getAmenities = () =>
  instance.get(`rooms/amenities`).then((response) => response.data);

export const getCategories = () =>
  instance.get(`categories`).then((response) => response.data);

export interface IUploadRoomVariables {
  name: string;
  country: string;
  city: string;
  price: number;
  rooms: number;
  toilets: number;
  description: string;
  address: string;
  pet_friendly: boolean;
  kind: string;
  amenities: number[];
  category: number;
}

export const uploadRoom = (variables: IUploadRoomVariables) =>
  instance
    .post(`rooms/`, variables, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
      },
    })
    .then((response) => response.data);

type CheckBookingQueryKey = [string, string?, Date[]?];

export const checkBooking = ({
  queryKey,
}: QueryFunctionContext<CheckBookingQueryKey>) => {
  const [, roomPk, dates] = queryKey;
  if (dates) {
    const [firstDate, secondDate] = dates;
    const checkIn = firstDate?.toLocaleDateString("fr-CA");
    const checkOut = secondDate?.toLocaleDateString("fr-CA");
    return instance
      .get(`rooms/${roomPk}/bookings/check?check_in=${checkIn}&check_out=${checkOut}`)
      .then((response) => response.data);
  }
};

export const cancelBooking = (bookingPk: number) =>
  instance
    .delete(`bookings/${bookingPk}/`, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.status);

export const getRoomBookings = ({ queryKey }: QueryFunctionContext) => {
  const [, roomPk] = queryKey;
  return instance.get(`rooms/${roomPk}/bookings`).then((r) => r.data);
};

export const uploadExperiencePhoto = (experiencePk: string, file: File, description: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description);
  return instance
    .post(`experiences/${experiencePk}/photos`, formData, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
};

export interface IUploadExperienceVariables {
  name: string;
  country: string;
  city: string;
  price: number;
  address: string;
  start: string;
  end: string;
  description: string;
}

export const uploadExperience = (variables: IUploadExperienceVariables) =>
  instance
    .post(`experiences/`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((response) => response.data);

export const deleteRoom = (roomPk: string) =>
  instance
    .delete(`rooms/${roomPk}`, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.status);

export const updateRoom = (roomPk: string, variables: Partial<IUploadRoomVariables>) =>
  instance
    .put(`rooms/${roomPk}`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.data);

export const deletePhoto = (photoPk: number | string) =>
  instance
    .delete(`medias/photos/${photoPk}`, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.status);

export interface IChangePasswordVariables {
  old_password: string;
  new_password: string;
}

export const changePassword = (variables: IChangePasswordVariables) =>
  instance
    .put(`users/change-password`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.data);

export const getPublicUser = ({ queryKey }: QueryFunctionContext) => {
  const [, username] = queryKey;
  return instance.get(`users/@${username}`).then((r) => r.data);
};

export const getUserRooms = ({ queryKey }: QueryFunctionContext) => {
  const [, username] = queryKey;
  return instance.get(`users/@${username}/rooms`).then((r) => r.data);
};

export const getUserReviews = ({ queryKey }: QueryFunctionContext) => {
  const [, username] = queryKey;
  return instance.get(`users/@${username}/reviews`).then((r) => r.data);
};

export interface ICreateExperienceBookingVariables {
  check_in: string;
  check_in_time?: string;
  check_out_time?: string;
  guests: number;
}

export const createExperienceBooking = (experiencePk: string, variables: ICreateExperienceBookingVariables) =>
  instance
    .post(`experiences/${experiencePk}/bookings`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.data);

type CheckExperienceBookingQueryKey = [string, string?, Date?];

export const checkExperienceBooking = ({
  queryKey,
}: QueryFunctionContext<CheckExperienceBookingQueryKey>) => {
  const [, experiencePk, date] = queryKey;
  if (date) {
    const checkIn = date.toLocaleDateString("fr-CA");
    return instance
      .get(`experiences/${experiencePk}/bookings/check?check_in=${checkIn}`)
      .then((r) => r.data);
  }
};

export const getExperienceBookings = ({ queryKey }: QueryFunctionContext) => {
  const [, experiencePk] = queryKey;
  return instance.get(`experiences/${experiencePk}/bookings`).then((r) => r.data);
};

export const updateExperience = (experiencePk: string, variables: Partial<IUploadExperienceVariables>) =>
  instance
    .put(`experiences/${experiencePk}/`, variables, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.data);

export const deleteExperience = (experiencePk: string) =>
  instance
    .delete(`experiences/${experiencePk}/`, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.status);

export const getUserExperiences = ({ queryKey }: QueryFunctionContext) => {
  const [, username] = queryKey;
  return instance.get(`users/@${username}/experiences`).then((r) => r.data);
};

export const toggleWishlistExperience = (wishlistPk: number, experiencePk: number) =>
  instance
    .put(`wishlists/${wishlistPk}/experiences/${experiencePk}`, null, {
      headers: { "X-CSRFToken": Cookie.get("csrftoken") || "" },
    })
    .then((r) => r.data);
