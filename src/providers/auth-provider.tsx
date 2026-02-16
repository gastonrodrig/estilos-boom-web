'use client';

import { useEffect } from "react";
import { useAppDispatch } from "@store";
import { onAuthStateChanged } from "firebase/auth";
import { FirebaseAuth } from "@lib";
import { login, logout, checkingCredentials } from "@store";
import { clientApi } from "@api";
import { UserStatus } from "@enums";
import toast from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkingCredentials());

    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      try {
        if (!user) {
          dispatch(logout());
          return;
        }

        const email = user.email;
        if (!email) {
          dispatch(logout());
          return;
        }

        const { data } = await clientApi.get(`/find/${email}`);

        if (data.status === UserStatus.INACTIVO) {
          toast.error("Tu cuenta está inactiva. Contacta al soporte para más información.");
          dispatch(logout());
          return;
        }

        dispatch(
          login({
            id: data.id_user,
            uid: data.auth_id,
            email: data.email,
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
            phone: data.phone ?? null,
            documentType: data.document_type ?? null,
            documentNumber: data.document_number ?? null,
            role: data.role,
            clientType: data.client.client_type ?? null,
            needsPasswordChange: data.client.needs_password_change,
            userStatus: data.status,
            photoURL: data.client.profile_picture ?? null,
            isExtraDataCompleted: data.client.is_extra_data_completed,
            companyData: data.client.client_company ?? null,
          })
        );

      } catch {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
