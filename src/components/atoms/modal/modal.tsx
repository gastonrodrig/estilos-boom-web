"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  title?: React.ReactNode;
  titleClassName?: string;
  description?: React.ReactNode;
};

export const Modal = ({
  open,
  onClose,
  children,
  panelClassName = "relative bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-[#EAE0E2] dark:border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-2xl space-y-6",
  title,
  titleClassName = "text-2xl font-medium text-[#40202D] dark:text-white tracking-wide",
  description,
}: ModalProps) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={panelClassName}>
              {title && (
                <Dialog.Title as={typeof title === "string" ? "h2" : "div"} className={titleClassName}>
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-[13px] font-medium text-[#8C6B79] dark:text-gray-300">{description}</Dialog.Description>
              )}
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
