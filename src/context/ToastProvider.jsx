// ToastContext.js
import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from "react-icons/hi";

const ToastContext = createContext();

const toastConfig = {
  success: {
    icon: <HiCheckCircle className="text-xl flex-shrink-0" />,
    iconClass: "text-success-500",
    boxClass: "bg-success-500/12 border-success-500/25",
    barClass: "bg-success-500",
  },
  error: {
    icon: <HiXCircle className="text-xl flex-shrink-0" />,
    iconClass: "text-error-500",
    boxClass: "bg-error-500/12 border-error-500/25",
    barClass: "bg-error-500",
  },
  info: {
    icon: <HiInformationCircle className="text-xl flex-shrink-0" />,
    iconClass: "text-brand-500",
    boxClass: "bg-brand-500/12 border-brand-500/25",
    barClass: "bg-brand-500",
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
      <div className="fixed top-4 right-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-[360px] flex-col gap-2.5">
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
                className={`relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ${config.boxClass}`}
              >
                {/* Colored left bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${config.barClass}`}
                />

                {/* Icon */}
                <span className={`ml-1 ${config.iconClass}`}>
                  {config.icon}
                </span>

                {/* Message */}
                <p className="flex-1 text-sm font-medium leading-snug text-neutral-200">
                  {toast.message}
                </p>

                {/* Close */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-tint-strong text-neutral-500 transition-all hover:bg-tint-strong"
                >
                  <HiX className="text-xs" />
                </button>

                {/* Auto-dismiss progress bar */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 opacity-60 ${config.barClass}`}
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
