"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { create } from "zustand";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  toast: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...t, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = t.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
      }, duration);
    }
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Shortcut helper
export const toast = (title: string, options?: Omit<ToastItem, "id" | "title">) => {
  useToastStore.getState().toast({ title, ...options });
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-error shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none font-sans">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-surface border border-border-color p-4 rounded-lg shadow-md pointer-events-auto flex items-start gap-3"
          >
            {icons[item.type || "info"]}
            <div className="flex-1 flex flex-col space-y-0.5">
              <span className="text-sm font-semibold text-text-primary">
                {item.title}
              </span>
              {item.description && (
                <span className="text-xs text-text-secondary">
                  {item.description}
                </span>
              )}
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
