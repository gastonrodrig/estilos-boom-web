"use client";

import {
  setLogoutSuppression,
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
import { useUsersStore } from "@hooks";
import { clientApi } from "@api";
import { getFirebaseAuthToken } from "@helpers";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { UserStatus } from "@enums";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");

export const useAuthStore = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const auth = useAppSelector((state) => state.auth);
  const { uid } = auth ;

  const { findUserByEmail, startCreateUser } = useUsersStore();


  // Login con Google
  const onGoogleSignIn = async (): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const { user } = 
      await signInWithPopup(FirebaseAuth, googleProvider) as any;

      const email = user.providerData[0]?.email;
      if (!email) return false;

      const { ok, data } = await findUserByEmail(email);

      // Crear usuario si no existe
      if (!ok) {
        const response = await startCreateUser(user, "google");

        if (!response.ok) return false;
        const newUser = response.data;

        console.log("New User Data:", newUser);

        dispatch(
          login({
            id: newUser.user.id_user,
            uid: newUser.user.auth_id,
            email: newUser.user.email,
            firstName: null,
            lastName: null,
            phone: null,
            documentType: null,
            documentNumber: null,
            role: newUser.user.role,
            needsPasswordChange: false,
            userStatus: newUser.user.status,
            photoURL: newUser.client.profile_picture ?? null,
            isExtraDataCompleted: newUser.client.is_extra_data_completed,
            companyData: null,
            clientType: null,
          })
        );

        return true;
      }

      if (data.status === UserStatus.INACTIVO) {
        toast.error("Tu cuenta está inactiva. Contacta al soporte para más información.");
        dispatch(logout());
        return false;
      }

      const needsPassword = !!data.needs_password_change;

      // Login normal
      dispatch(
        login({
          id: data.id_user,
          uid: data.auth_id,
          email: data.email,
          firstName: data.first_name ?? null,
          lastName: data.last_name ?? null,
          phone: data.phone,
          documentType: data.document_type,
          documentNumber: data.document_number,
          role: data.role,
          needsPasswordChange: data.client.needs_password_change,
          userStatus: data.status,
          photoURL: data.client.profile_picture ?? null,
          isExtraDataCompleted: data.client.is_extra_data_completed,
          companyData: data.client.client_company ?? null,
          clientType: data.client.client_type
        })
      );

      return !needsPassword;

    } catch (error: unknown) {
      const err = error as HttpError;
      dispatch(logout());
      toast.error(
        err.response?.data?.message ?? 
          "Error al iniciar sesión."
      );
      console.log(err);
      return false;
    }
  };

  // Login email / password
  const startLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const { user } = await signInWithEmailAndPassword(
        FirebaseAuth,
        email,
        password
      ) as any;

      const { data } = await findUserByEmail(user.providerData[0].email!);

      if (data.status === "Inactivo") {
        toast.error("Usuario inactivo. Contacta al soporte.");
        dispatch(logout());
        return false;
      }

      if (data.role === "Cliente") {
        toast.error("Este rol no tiene permitido iniciar sesión en esta aplicación.");
        dispatch(logout());
        return false;
      }

      const needsPassword = !!data.needs_password_change;

      dispatch(
        login({
          id: data.id_user,
          uid: data.auth_id,
          email: data.email,
          firstName: data.first_name ?? null,
          lastName: data.last_name ?? null,
          phone: data.phone,
          documentType: data.document_type,
          documentNumber: data.document_number,
          role: data.role,
          needsPasswordChange: data.client.needs_password_change,
          userStatus: data.status,
          photoURL: data.client.profile_picture ?? null,
          isExtraDataCompleted: data.client.is_extra_data_completed,
          companyData: data.client.client_company ?? null,
          clientType: data.client.client_type
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
  const startRegisterUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const exists = await findUserByEmail(email);
      if (exists.ok) {
        toast.error("Este correo ya está registrado.");
        dispatch(logout());
        return false;
      }

      const { user } = await createUserWithEmailAndPassword(
        FirebaseAuth,
        email,
        password
      ) as any;

      const response = await startCreateUser(user, "email/password");

      if (!response.ok) return false;

      const newUser = response.data;

      dispatch(
        login({
          id: newUser.user.id_user,
          uid: newUser.user.auth_id,
          email: newUser.user.email,
          firstName: null,
          lastName: null,
          phone: null,
          documentType: null,
          documentNumber: null,
          role: newUser.user.role,
          needsPasswordChange: false,
          userStatus: newUser.user.status,
          photoURL: null,
          isExtraDataCompleted: newUser.client.is_extra_data_completed,
          companyData: null,
          clientType: null,
        })
      );

      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      dispatch(logout());
      toast.error(
        err.response?.data?.message ??
          "Error al crear usuario."
      );
      console.log(err);
      return false;
    }
  };

  // Logout
  const onLogout = async () => {
    await signOut(FirebaseAuth);
    dispatch(logout());
    dispatch(setLogoutSuppression(true));
    setTimeout(() => dispatch(setLogoutSuppression(false)), 400);
    router.replace("/auth/login");
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
