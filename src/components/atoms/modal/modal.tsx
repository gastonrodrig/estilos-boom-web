"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export const Modal = ({
  open,
  onClose,
  children,
  panelClassName = "relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4",
  title,
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
            <div className="fixed inset-0 bg-black/30" />
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
              {title && <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>}
              {description && (
                <Dialog.Description className="text-sm text-neutral-600">{description}</Dialog.Description>
              )}
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
