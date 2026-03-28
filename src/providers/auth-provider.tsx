"use client";

import { useEffect, useCallback, useRef } from "react";
import { login, logout, checkingCredentials, useAppDispatch } from "@store";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FirebaseAuth } from "@lib";
import { AuthApi } from "@api";
import { getAuthConfig } from "@utils";
import toast from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const hasInitializedRef = useRef(false);
  const syncingRef = useRef(false);
  const processedTokenRef = useRef<string | null>(null);

  const handleLogout = useCallback(
    async (shouldSignOutFirebase = true) => {
      console.log("[AuthProvider] handleLogout:start", { shouldSignOutFirebase });

      if (shouldSignOutFirebase) {
        await signOut(FirebaseAuth);
        console.log("[AuthProvider] handleLogout:firebaseSignOut:done");
      }

      dispatch(logout());
      processedTokenRef.current = null;

      console.log("[AuthProvider] handleLogout:reduxLogout:done");
    },
    [dispatch],
  );

  useEffect(() => {
    console.log("[AuthProvider] useEffect:init");
    dispatch(checkingCredentials());
    console.log("[AuthProvider] checkingCredentials:dispatched");

    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      console.log("[AuthProvider] onAuthStateChanged:triggered", {
        hasUser: !!user,
        syncing: syncingRef.current,
        initialized: hasInitializedRef.current,
      });

      if (syncingRef.current) {
        console.log("[AuthProvider] onAuthStateChanged:skipped(syncingRef=true)");
        return;
      }

      syncingRef.current = true;

      try {
        if (!user) {
          console.log("[AuthProvider] user:null");

          if (!hasInitializedRef.current) {
            dispatch(logout());
            hasInitializedRef.current = true;
            console.log("[AuthProvider] first-null:init-logout-dispatched");
            return;
          }

          await handleLogout(false);
          hasInitializedRef.current = true;
          console.log("[AuthProvider] user-null:handleLogout(false):done");
          return;
        }

        console.log("[AuthProvider] user:present", { uid: user.uid });

        const token = await user.getIdToken();
        console.log("[AuthProvider] token:obtained", {
          tokenLength: token?.length ?? 0,
          tokenPreview: token ? `${token.slice(0, 10)}...` : null,
        });

        if (processedTokenRef.current === token) {
          hasInitializedRef.current = true;
          console.log("[AuthProvider] token:already-processed:skip-sync");
          return;
        }

        console.log("[AuthProvider] sync:start");
        const { data } = await AuthApi.post("/sync", {}, getAuthConfig({ token }));
        console.log("[AuthProvider] sync:success", {
          userStatus: data?.user?.status,
          authId: data?.user?.auth_id,
          role: data?.user?.role,
        });

        if (data.user.status === "Inactivo") {
          console.log("[AuthProvider] user:inactive -> forced logout");
          toast.error("Tu cuenta está inactiva. Contacta al soporte.");
          await handleLogout(true);
          hasInitializedRef.current = true;
          return;
        }

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
          }),
        );

        console.log("[AuthProvider] login:dispatched");

        processedTokenRef.current = token;
        hasInitializedRef.current = true;

        console.log("[AuthProvider] state:updated", {
          initialized: hasInitializedRef.current,
          hasProcessedToken: !!processedTokenRef.current,
        });
      } catch (error) {
        console.log("[AuthProvider] sync:error", error);
        await handleLogout(false);
        hasInitializedRef.current = true;
        console.log("[AuthProvider] catch:handleLogout(false):done");
      } finally {
        syncingRef.current = false;
        console.log("[AuthProvider] finally:syncingRef=false");
      }
    });

    return () => {
      console.log("[AuthProvider] useEffect:cleanup");
      unsubscribe();
    };
  }, [dispatch, handleLogout]);

  return <>{children}</>;
}