/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeProvider";

const Modal = ({ open, onClose, title, children }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      data-theme={theme}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/70 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-elevated relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-card border-hairline-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-hairline-soft bg-canvas px-5 py-4">
          <h3 className="font-semibold text-neutral-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-tint hover:text-neutral-100"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
