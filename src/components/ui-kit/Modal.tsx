import React from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void; // required, no undefined
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        {title && (
          <h2 className="mb-4 text-lg font-semibold" id="modal-title">
            {title}
          </h2>
        )}
        <div>{children}</div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
