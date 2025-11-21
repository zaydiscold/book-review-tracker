/**
 * Toast notification overlay component
 */
import { createPortal } from "react-dom";

export function ToastOverlay({ toast, onDismiss }) {
  if (!toast) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  const toneClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    danger: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white"
  };

  const className = toneClasses[toast.tone] || toneClasses.info;

  return createPortal(
    <div
      className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-soft-lg flex items-center gap-4 z-50 animate-slide-up ${className}`}
      role={toast.tone === "error" || toast.tone === "danger" ? "alert" : "status"}
      aria-live={toast.tone === "error" || toast.tone === "danger" ? "assertive" : "polite"}
    >
      <span className="font-medium">{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto text-white hover:opacity-75 transition-opacity text-2xl leading-none"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>,
    document.body
  );
}
