// ToastContext.js
import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from "react-icons/hi";

const ToastContext = createContext();

const toastConfig = {
  success: {
    icon: <HiCheckCircle className="text-xl flex-shrink-0" />,
    iconColor: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    bar: "#34d399",
  },
  error: {
    icon: <HiXCircle className="text-xl flex-shrink-0" />,
    iconColor: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    bar: "#f87171",
  },
  info: {
    icon: <HiInformationCircle className="text-xl flex-shrink-0" />,
    iconColor: "#60a5fa",
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.25)",
    bar: "#6366f1",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5"
        style={{ maxWidth: "360px", width: "calc(100vw - 2rem)" }}
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = toastConfig[toast.type] || toastConfig.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden rounded-xl flex items-start gap-3 px-4 py-3"
                style={{
                  background: config.bg,
                  border: `1px solid ${config.border}`,
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                {/* Colored left bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: config.bar }}
                />

                {/* Icon */}
                <span style={{ color: config.iconColor, marginLeft: "4px" }}>
                  {config.icon}
                </span>

                {/* Message */}
                <p
                  className="flex-1 text-sm font-medium leading-snug"
                  style={{ color: "#e2e8f0" }}
                >
                  {toast.message}
                </p>

                {/* Close */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <HiX className="text-xs" />
                </button>

                {/* Auto-dismiss progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5"
                  style={{ background: config.bar, opacity: 0.5 }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
