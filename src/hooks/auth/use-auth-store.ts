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
  showSnackbar,
  hydrateProfile
} from "@store";
import { getAuthConfig } from "@utils";
import { FirebaseAuth } from "@lib";
import { HttpError } from "@types";
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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");

export const useAuthStore = () => {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);
  const { uid } = auth ;

  const { findUserByEmail, startCreateUser } = useUsersStore();

  const openSnackbar = (message: string) => dispatch(showSnackbar({ message }));

  // Login con Google
  const onGoogleSignIn = async (): Promise<boolean> => {
    try {
      dispatch(checkingCredentials());

      const { user } = await signInWithPopup(FirebaseAuth, googleProvider) as any;

      const email = user.providerData[0]?.email;
      if (!email) return false;

      const { ok, data } = await findUserByEmail(email);

      if (!ok) {
        // Crear nuevo usuario
        const response = await startCreateUser(user, "google");

        if (!response.ok) return false;
        const newUser = response.data;

        dispatch(
          hydrateProfile({
            _id: newUser._id,
            uid: newUser.auth_id,
            email: newUser.email,
            firstName: null,
            lastName: null,
            phone: null,
            documentType: null,
            documentNumber: null,
            role: newUser.role,
            needsPasswordChange: false,
            userStatus: newUser.status,
            photoURL: newUser.profile_picture ?? null,
            isExtraDataCompleted: newUser.is_extra_data_completed,
          })
        );

        return true;
      }

      // Usuario encontrado
      if (data.status === "Inactivo") {
        dispatch(logout());
        return false;
      }

      const needsPassword = !!data.needs_password_change;

      dispatch(
        hydrateProfile({
          _id: data._id,
          uid: data.auth_id,
          email: data.email,
          firstName: data.first_name ?? null,
          lastName: data.last_name ?? null,
          phone: data.phone ?? null,
          documentType: data.document_type ?? null,
          documentNumber: data.document_number ?? null,
          role: data.role,
          needsPasswordChange: data.needs_password_change,
          userStatus: data.status,
          photoURL: data.profile_picture ?? null,
          isExtraDataCompleted: data.is_extra_data_completed,
        })
      );

      return !needsPassword;
    } catch (error: unknown) {
      const err = error as HttpError;
      dispatch(logout());
      openSnackbar(
        err.response?.data?.message ?? 
          "Error al iniciar sesión."
      );
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
        dispatch(logout());
        return false;
      }

      if (data.role === "Cliente") {
        openSnackbar(
          "Este rol no tiene permitido iniciar sesión en esta aplicación."
        );
        dispatch(logout());
        return false;
      }

      const needsPassword = !!data.needs_password_change;

      dispatch(
        hydrateProfile({
          _id: data._id,
          uid: data.auth_id,
          email: data.email,
          firstName: data.first_name ?? null,
          lastName: data.last_name ?? null,
          phone: data.phone ?? null,
          documentType: data.document_type ?? null,
          documentNumber: data.document_number ?? null,
          role: data.role,
          needsPasswordChange: data.needs_password_change,
          userStatus: data.status,
          photoURL: data.profile_picture ?? null,
          isExtraDataCompleted: data.is_extra_data_completed,
        })
      );

      return !needsPassword;
    } catch (error: unknown) {
      const err = error as HttpError;
      dispatch(logout());
      openSnackbar(
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
        openSnackbar("Este correo ya está registrado.");
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

      const data = response.data;

      dispatch(
        hydrateProfile({
          _id: data._id,
          uid: data.auth_id,
          email: data.email,
          firstName: null,
          lastName: null,
          phone: null,
          documentType: null,
          documentNumber: null,
          role: data.role,
          needsPasswordChange: false,
          userStatus: data.status,
          photoURL: null,
          isExtraDataCompleted: data.is_extra_data_completed,
        })
      );

      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      dispatch(logout());
      openSnackbar(
        err.response?.data?.message 
          ?? "Error al crear usuario."
      );
      return false;
    }
  };

  // Logout
  const onLogout = async () => {
    await signOut(FirebaseAuth);
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
      openSnackbar("Las contraseñas no coinciden.");
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
      openSnackbar("Contraseña actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      openSnackbar(
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

      openSnackbar("Correo enviado correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;
      openSnackbar(
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
      openSnackbar("Las contraseñas no coinciden.");
      return false;
    }

    try {
      dispatch(changingPassword());

      const params = new URLSearchParams(window.location.search);
      const code = params.get("oobCode");

      if (!code) {
        openSnackbar("El enlace no es válido.");
        return false;
      }

      const auth = getAuth();
      const email = await verifyPasswordResetCode(auth, code);

      await confirmPasswordReset(auth, code, password);
      await signInWithEmailAndPassword(auth, email, password);

      await startLogin({ email, password });

      openSnackbar("Contraseña actualizada correctamente.");
      return true;
    } catch (error: unknown) {
      const err = error as HttpError;

      openSnackbar(
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
