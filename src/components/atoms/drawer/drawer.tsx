"use client";

import { useEffect } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
  side?: "left" | "right";
};

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  children,
  widthClass = "max-w-md",
  side = "right",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  const positionClass = side === "left" ? "left-0" : "right-0";
  const closedTransformClass = side === "left" ? "-translate-x-full" : "translate-x-full";

  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-100 ${open ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`absolute ${positionClass} top-0 h-full w-full ${widthClass}
          bg-white shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : closedTransformClass}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
