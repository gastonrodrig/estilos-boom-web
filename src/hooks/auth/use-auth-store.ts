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
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { UserStatus } from "@enums";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");
googleProvider.addScope("profile");

export const useAuthStore = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const auth = useAppSelector((state) => state.auth);
  const { uid } = auth ;

  const onGoogleSignIn = async (): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());
      // 1. Login con Firebase
      const result = await signInWithPopup(FirebaseAuth, googleProvider);
      const firebaseUser = result.user;

      // 2. Token
      const token = await firebaseUser.getIdToken();

      // 3. Sync backend
      const { data } = await AuthApi.post(
        "/sync",
        {},
        getAuthConfig({ token })
      );

      const user = data.user;

      // 4. Dispatch login
      dispatch(
        login({
          id: user.id_user,
          uid: user.auth_id,
          email: user.email,
          role: user.role,
          userStatus: user.status,

          firstName: user.client?.first_name ?? null,
          lastName: user.client?.last_name ?? null,
          phone: user.client?.phone ?? null,
          documentType: user.client?.document_type ?? null,
          documentNumber: user.client?.document_number ?? null,

          clientType: user.client?.client_type ?? null,
          needsPasswordChange:
            user.client?.needs_password_change ?? null,
          isExtraDataCompleted:
            user.client?.is_extra_data_completed ?? false,

          companyData: user.client?.client_company
            ? {
                companyName:
                  user.client.client_company.company_name,
                contactName:
                  user.client.client_company.contact_name,
              }
            : null,

          photoURL: firebaseUser.photoURL,
        })
      );

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

  const startLogin = ({ 
    email, 
    password 
  }: { 
    email: string; 
    password: string 
  }) => async (): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      // 1. Login Firebase
      const { user } = await signInWithEmailAndPassword(
        FirebaseAuth,
        email,
        password
      );

      // 2. Token
      const token = await user.getIdToken();

      // 3. Sync backend
      const { data } = await AuthApi.post(
        "/sync",
        {},
        getAuthConfig({ token })
      );

      const backendUser = data.user;

      // 4. Validaciones
      if (backendUser.status === UserStatus.INACTIVO) {
        toast.error("Usuario inactivo. Contacta al soporte.");

        await FirebaseAuth.signOut();
        dispatch(logout());

        return false;
      }

      const needsPassword =
        backendUser.client?.needs_password_change ?? false;

      // 5. Dispatch login
      dispatch(
        login({
          id: backendUser.id_user,
          uid: backendUser.auth_id,
          email: backendUser.email,
          role: backendUser.role,
          userStatus: backendUser.status,

          firstName: backendUser.client?.first_name ?? null,
          lastName: backendUser.client?.last_name ?? null,
          phone: backendUser.client?.phone ?? null,
          documentType: backendUser.client?.document_type ?? null,
          documentNumber:
            backendUser.client?.document_number ?? null,

          clientType: backendUser.client?.client_type ?? null,
          needsPasswordChange:
            backendUser.client?.needs_password_change ?? null,
          isExtraDataCompleted:
            backendUser.client?.is_extra_data_completed ?? false,

          companyData: backendUser.client?.client_company
            ? {
                companyName:
                  backendUser.client.client_company.company_name,
                contactName:
                  backendUser.client.client_company.contact_name,
              }
            : null,

          photoURL: backendUser.client?.profile_picture ?? null,
        })
      );

      toast.success("Inicio de sesión exitoso.");

      return !needsPassword;
    } catch (error: unknown) {
      const err = error as HttpError;

      dispatch(logout());

      toast.error(
        err.response?.data?.message ??
          "Error al iniciar sesión."
      );

      return false;
    }
  };

  // Registro de usuario con email / password
  const startRegisterUser =({ 
    email, 
    password 
  }: { 
    email: string; 
    password: string 
  }) => async (): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      // 1. Crear usuario en Firebase
      const { user } = await createUserWithEmailAndPassword(
        FirebaseAuth,
        email,
        password
      );

      // 2. Obtener token
      const token = await user.getIdToken();

      // 3. Sync backend
      const { data } = await AuthApi.post(
        "/sync",
        {},
        getAuthConfig({ token })
      );

      const backendUser = data.user;

      // Validación 
      if (backendUser.status === UserStatus.INACTIVO) {
        toast.error("Usuario inactivo.");

        await FirebaseAuth.signOut();
        dispatch(logout());

        return false;
      }

      // 4. Dispatch
      dispatch(
        login({
          id: backendUser.id_user,
          uid: backendUser.auth_id,
          email: backendUser.email,
          role: backendUser.role,
          userStatus: backendUser.status,

          firstName: backendUser.client?.first_name ?? null,
          lastName: backendUser.client?.last_name ?? null,
          phone: backendUser.client?.phone ?? null,
          documentType: backendUser.client?.document_type ?? null,
          documentNumber:
            backendUser.client?.document_number ?? null,

          clientType: backendUser.client?.client_type ?? null,
          needsPasswordChange:
            backendUser.client?.needs_password_change ?? null,
          isExtraDataCompleted:
            backendUser.client?.is_extra_data_completed ?? false,

          companyData: backendUser.client?.client_company
            ? {
                companyName:
                  backendUser.client.client_company.company_name,
                contactName:
                  backendUser.client.client_company.contact_name,
              }
            : null,

          photoURL: backendUser.client?.profile_picture ?? null,
        })
      );

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

  // Logout
  const onLogout = async () => {
    await signOut(FirebaseAuth);
    router.replace("/auth/login");
    dispatch(logout());
  };

  // Cambio de contraseña en primer login
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

      await clientApi.patch(
        `/reset-password-flag/${uid}`,
        {},
        getAuthConfig({ token })
      );

      dispatch(authenticated());
      toast.success("Contraseña actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      toast.error(
        err.response?.data?.message ??
          "Error al actualizar la contraseña."
      );
      return false;
    }
  };

  // Enviar email para restablecer contraseña
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
      toast.error(
        err.response?.data?.message ??
          "Error al enviar enlace de recuperación."
      );
      return false;
    } finally {
      dispatch(resetEmailSent());
    }
  };

  // Cambio de contraseña desde enlace de recuperación
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

      const auth = getAuth();
      const email = await verifyPasswordResetCode(auth, code);

      await confirmPasswordReset(auth, code, password);
      await signInWithEmailAndPassword(auth, email, password);

      await startLogin({ email, password });

      toast.success("Contraseña actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;

      toast.error(
        err.response?.data?.message ??
          "No se pudo actualizar la contraseña."
      );

      dispatch(logout());
      return false;
    }
  };

  return {
    // State
    ...auth,

    // Actions
    onGoogleSignIn,
    startLogin,
    startRegisterUser,
    onLogout,
    startChangePasswordFirstLogin,
    startPasswordReset,
    startChangePasswordForgot,
  };
};
