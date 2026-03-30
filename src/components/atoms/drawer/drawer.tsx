"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

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
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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

  const isLeft = side === "left";
  const panelSideClass = isLeft ? "left-0" : "right-0";
  const hiddenX = isLeft ? "-100%" : "100%";

  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          aria-hidden={!open}
          className="fixed inset-0 z-[100]"
          initial={{ pointerEvents: "none" }}
          animate={{ pointerEvents: "auto" }}
          exit={{ pointerEvents: "none" }}
        >
          <motion.button
            type="button"
            aria-label="Cerrar drawer"
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className={`absolute top-0 h-full w-full ${widthClass} ${panelSideClass} bg-white shadow-2xl`}
            initial={{ x: hiddenX }}
            animate={{ x: "0%" }}
            exit={{ x: hiddenX }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
