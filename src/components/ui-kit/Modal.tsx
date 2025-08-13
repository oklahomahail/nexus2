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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal container using your design system */}
      <div
        className="w-full max-w-lg rounded-2xl bg-surface border border-surface shadow-strong p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {title && (
          <h2
            className="mb-4 text-xl font-semibold text-text-primary"
            id="modal-title"
          >
            {title}
          </h2>
        )}
        <div className="text-text-primary">{children}</div>
      </div>
    </div>
  );
}
