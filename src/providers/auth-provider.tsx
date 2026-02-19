'use client';

import { useEffect, useCallback } from "react";
import { login, logout, checkingCredentials, useAppDispatch } from "@store";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FirebaseAuth } from "@lib";
import { AuthApi } from "@api";
import { getFirebaseAuthToken } from "@helpers";
import { getAuthConfig } from "@utils";
import toast from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(async () => {
    await signOut(FirebaseAuth);
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    dispatch(checkingCredentials());

    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      try {
        if (!user) {
          // Limpia estado
          await handleLogout();
          return;
        }

        const token = await getFirebaseAuthToken();
        const { data } = await AuthApi.post("/sync", {}, getAuthConfig({ token }));

        if (data.user.status === "Inactivo") {
          toast.error("Tu cuenta está inactiva. Contacta al soporte.");
          await handleLogout();
          return;
        }

        await user.getIdToken(true);

        const u = data.user;
        dispatch(
          login({
            id: u.id_user,
            uid: u.auth_id,
            email: u.email,
            firstName: u.first_name ?? null,
            lastName: u.last_name ?? null,
            phone: u.phone ?? null,
            documentType: u.document_type ?? null,
            documentNumber: u.document_number ?? null,
            role: u.role,
            clientType: u.client?.client_type ?? null,
            needsPasswordChange: u.client?.needs_password_change ?? false,
            userStatus: u.status,
            photoURL: u.client?.profile_picture ?? null,
            isExtraDataCompleted: u.client?.is_extra_data_completed ?? false,
            companyData: u.client?.client_company ?? null,
          })
        );
      } catch (error) {
        await handleLogout();
        console.log("Error sincronizando sesión:", error);
      }
    });

    return () => unsubscribe();
  }, [dispatch, handleLogout]);

  return <>{children}</>;
}
