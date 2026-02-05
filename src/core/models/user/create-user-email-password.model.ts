import { CreateUserEmailPasswordModelInput } from "@/core/types";

export const createUserEmailPasswordModel = (
  user: CreateUserEmailPasswordModelInput
) => ({
  auth_id: user.uid,
  email: user.providerData[0].email,
  profile_picture: null,
});
