"use client";

import { ReactNode } from "react";
import { ExtraInformationModal } from "@components";
import { useAppSelector } from "@store";

interface UserFlowGuardProps {
  children: ReactNode;
}

export const UserFlowGuard = ({ children }: UserFlowGuardProps) => {
  const { status, isExtraDataCompleted } = useAppSelector((state) => state.auth);

  const showExtraModal =
    status === "authenticated" && isExtraDataCompleted === false;

  return (
    <>
      {children}

      <ExtraInformationModal
        open={showExtraModal}
        onClose={() => {}}
      />
    </>
  );
};
