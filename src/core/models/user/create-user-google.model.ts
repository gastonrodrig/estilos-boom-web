import { CreateUserGoogleModelInput } from "@types";

export const createUserGoogleModel = (user: CreateUserGoogleModelInput) => ({
  auth_id: user.uid,
  email: user.providerData[0].email,
  profile_picture: user.photoURL,
});
