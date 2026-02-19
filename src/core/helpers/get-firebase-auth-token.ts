import { FirebaseAuth } from "@lib";

export const getFirebaseAuthToken = async (): Promise<string> => {
  const user = FirebaseAuth.currentUser;

  if (!user) {
    throw new Error("No authenticated user");
  }

  return await user.getIdToken();
};
