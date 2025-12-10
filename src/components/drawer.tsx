"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; // ej. "max-w-md"
};

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  children,
  widthClass = "max-w-md",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // bloquear scroll del body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 h-full w-full ${widthClass}
          bg-white shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
