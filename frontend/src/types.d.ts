export interface IRoomPhotoPhoto {
  pk: string;
  file: string | null;
  description: string;
  status: "pending_scan" | "approved" | "rejected";
}

export interface IRoomList {
  pk: number;
  name: string;
  country: string;
  city: string;
  price: number;
  rating: number;
  is_owner: boolean;
  thumbnail_url: string | null;
}

export interface IExperienceList {
  pk: number;
  name: string;
  country: string;
  city: string;
  price: number;
  description: string;
  start: string;
  end: string;
  is_owner: boolean;
  thumbnail_url: string | null;
  rating: number | null;
}

export interface IPerk {
  pk: number;
  name: string;
  detail: string;
  explanation: string;
}

export interface IExperienceDetail extends IExperienceList {
  address: string;
  description: string;
  host: IRoomOwner;
  perks: IPerk[];
  category: ICategory;
  photos: IRoomPhotoPhoto[];
  is_owner: boolean;
  max_participants: number;
  rating: number | null;
}

export interface IWishlist {
  pk: number;
  name: string;
  rooms: IRoomList[];
  experiences: IExperienceList[];
}

export interface IRoomOwner {
  public_id: string;
  name: string;
  bio: string;
  avatar: string;
  username: string;
}

export interface IAmenity {
  pk: number;
  name: string;
  description: string;
}

export interface ICategory {
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
  photos: IRoomPhotoPhoto[];
}

export interface IReview {
  pk: number;
  payload: string;
  rating: number;
  user: IRoomOwner;
  room_pk: number | null;
  experience_pk: number | null;
  room_name: string | null;
  room_thumbnail_url: string | null;
  experience_name: string | null;
  experience_thumbnail_url: string | null;
  created_at: string;
}

export interface IBooking {
  pk: number;
  check_in: string | null;
  check_out: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  guests: number;
  kind: "room" | "experience";
  room?: IRoomList;
  experience?: IExperienceList;
}

export interface IPublicUser {
  public_id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  email: string;
  date_joined: string;
}

export interface IUser {
  public_id: string;
  last_login: string;
  username: string;
  email: string;
  date_joined: string;
  avatar: string;
  name: string;
  bio: string;
  is_host: boolean;
  gender: string;
  language: string;
  currency: string;
}
