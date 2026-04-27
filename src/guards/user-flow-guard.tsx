"use client";

import { ReactNode } from "react";
import { ExtraInformationModal, ChangePasswordModal } from "@components";
import { useAppSelector } from "@store";

interface UserFlowGuardProps {
  children: ReactNode;
}

export const UserFlowGuard = ({ children }: UserFlowGuardProps) => {
  const { status, role, isExtraDataCompleted } = useAppSelector((state) => state.auth);

  const showExtraModal =
    status === "authenticated" && role !== "Almacenero" && isExtraDataCompleted === false;

  const showChangePasswordModal = status === "first-login-password";

  return (
    <>
      {children}

      <ExtraInformationModal
        open={showExtraModal}
        onClose={() => { }}
      />

      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => { }}
      />
    </>
  );
};
