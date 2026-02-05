import { FirebaseAuth } from "@lib";

/**
 * Obtiene el Firebase ID Token del usuario autenticado.
 * Firebase se encarga del refresh automáticamente.
 */
export async function getFirebaseAuthToken(): Promise<string> {
  const user = FirebaseAuth.currentUser;

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  return await user.getIdToken();
}
