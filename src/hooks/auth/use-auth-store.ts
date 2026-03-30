"use client";

import {
  useAppDispatch,
  useAppSelector,
  checkingCredentials,
  logout,
  authenticated,
  sendingResetEmail,
  resetEmailSent,
  changingPassword,
  login,
} from "@store";
import { getAuthConfig } from "@utils";
import { FirebaseAuth } from "@lib";
import { HttpError } from "@models";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { clientApi, AuthApi } from "@api";
import { getFirebaseAuthToken } from "@helpers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { UserStatus } from "@enums";
import { useCartStore } from "@hooks";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");
googleProvider.addScope("profile");

export const useAuthStore = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mergeLocalCartToRemote, loadCart } = useCartStore();

  const auth = useAppSelector((state) => state.auth);
  const { uid } = auth;

  const resolvePostAuthRedirect = () => {
    const returnTo = searchParams?.get("returnTo");
    if (returnTo && returnTo.startsWith("/")) {
      return returnTo;
    }
    return "/cart";
  };

  const syncGuestCartAfterAuth = async () => {
    await mergeLocalCartToRemote();
    await loadCart();
  };

  const completeAuthFlow = async () => {
    await syncGuestCartAfterAuth();

    if (pathname?.includes("/forgot-password")) return;

    router.replace(resolvePostAuthRedirect());
  };

  const syncAndDispatchLogin = async (token: string, photoURLFallback?: string | null) => {
    const { data } = await AuthApi.post("/sync", {}, getAuthConfig({ token }));
    const user = data.user;

    if (user.status === UserStatus.INACTIVO || user.status === "Inactivo") {
      toast.error("Usuario inactivo. Contacta al soporte.");
      await FirebaseAuth.signOut();
      dispatch(logout());
      return { ok: false as const, user: null };
    }

    dispatch(
      login({
        id: user.id_user,
        uid: user.auth_id,
        email: user.email,
        role: user.role,
        userStatus: user.status,

        firstName: user.client?.first_name ?? user.first_name ?? null,
        lastName: user.client?.last_name ?? user.last_name ?? null,
        phone: user.client?.phone ?? user.phone ?? null,
        documentType: user.client?.document_type ?? user.document_type ?? null,
        documentNumber: user.client?.document_number ?? user.document_number ?? null,

        clientType: user.client?.client_type ?? null,
        needsPasswordChange: user.client?.needs_password_change ?? false,
        isExtraDataCompleted: user.client?.is_extra_data_completed ?? false,

        companyData: user.client?.client_company
          ? {
              companyName: user.client.client_company.company_name,
              contactName: user.client.client_company.contact_name,
            }
          : null,

        photoURL: user.client?.profile_picture ?? photoURLFallback ?? null,
      }),
    );

    return { ok: true as const, user };
  };

  const onGoogleSignIn = async (): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const result = await signInWithPopup(FirebaseAuth, googleProvider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      const syncResult = await syncAndDispatchLogin(token, firebaseUser.photoURL);
      if (!syncResult.ok) return false;

      await completeAuthFlow();
      return true;
    } catch (error: unknown) {
      const err = error as FirebaseError;
      if (err.code === "auth/error-code:-47") {
        toast.error("Este correo ya está registrado con otro método de autenticación.");
      } else {
        toast.error("Error al iniciar sesión.");
      }
      dispatch(logout());
      return false;
    }
  };

  const startLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const { user } = await signInWithEmailAndPassword(FirebaseAuth, email, password);
      const token = await user.getIdToken();

      const syncResult = await syncAndDispatchLogin(token);
      if (!syncResult.ok) return false;

      const needsPassword = syncResult.user?.client?.needs_password_change ?? false;

      await completeAuthFlow();

      toast.success("Inicio de sesión exitoso.");
      return !needsPassword;
    } catch (error: unknown) {
      const err = error as HttpError;
      dispatch(logout());
      toast.error(err.response?.data?.message ?? "Error al iniciar sesión.");
      return false;
    }
  };

  const startRegisterUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const { user } = await createUserWithEmailAndPassword(FirebaseAuth, email, password);
      const token = await user.getIdToken();

      const syncResult = await syncAndDispatchLogin(token);
      if (!syncResult.ok) return false;

      await completeAuthFlow();

      toast.success("Usuario creado correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as FirebaseError;
      if (err.code === "auth/error-code:-47") {
        toast.error("Este correo ya está registrado con otro método de autenticación.");
      } else {
        toast.error("Error al crear cuenta.");
      }
      dispatch(logout());
      return false;
    }
  };

  const onLogout = async () => {
    await signOut(FirebaseAuth);
    dispatch(logout());
    router.replace("/auth/login");
  };

  const startChangePasswordFirstLogin = async ({
    password,
    confirmPassword,
  }: {
    password: string;
    confirmPassword: string;
  }): Promise<boolean> => {
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return false;
    }

    try {
      const user = FirebaseAuth.currentUser;
      if (!user) throw new Error("No authenticated user found");

      await updatePassword(user, password);

      const token = await getFirebaseAuthToken();
      await clientApi.patch(`/reset-password-flag/${uid}`, {}, getAuthConfig({ token }));

      dispatch(authenticated());
      toast.success("Contraseña actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      toast.error(err.response?.data?.message ?? "Error al actualizar la contraseña.");
      return false;
    }
  };

  const startPasswordReset = async ({
    email,
  }: {
    email: string;
  }): Promise<boolean> => {
    try {
      dispatch(sendingResetEmail());
      await clientApi.post("/forgot-password", { email });
      toast.success("Correo enviado correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      toast.error(err.response?.data?.message ?? "Error al enviar enlace de recuperación.");
      return false;
    } finally {
      dispatch(resetEmailSent());
    }
  };

  const startChangePasswordForgot = async ({
    password,
    confirmPassword,
  }: {
    password: string;
    confirmPassword: string;
  }): Promise<boolean> => {
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return false;
    }

    try {
      dispatch(changingPassword());

      const params = new URLSearchParams(window.location.search);
      const code = params.get("oobCode");

      if (!code) {
        toast.error("El enlace no es válido.");
        return false;
      }

      const authInstance = getAuth();
      const email = await verifyPasswordResetCode(authInstance, code);

      await confirmPasswordReset(authInstance, code, password);
      await signInWithEmailAndPassword(authInstance, email, password);

      await startLogin({ email, password });

      toast.success("Contraseña actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      toast.error(err.response?.data?.message ?? "No se pudo actualizar la contraseña.");
      dispatch(logout());
      return false;
    }
  };

  return {
    ...auth,

    onGoogleSignIn,
    startLogin,
    startRegisterUser,
    onLogout,
    startChangePasswordFirstLogin,
    startPasswordReset,
    startChangePasswordForgot,
  };
};
