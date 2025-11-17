/**
 * Toast notification overlay component
 */
import { createPortal } from "react-dom";
import { styles } from "../styles/appStyles";

export function ToastOverlay({ toast, onDismiss }) {
  if (!toast) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  const toneStyle =
    toast.tone === "success"
      ? styles.toastSuccess
      : toast.tone === "error" || toast.tone === "danger"
      ? styles.toastDanger
      : toast.tone === "warning"
      ? styles.toastWarning
      : styles.toastInfo;

  return createPortal(
    <div
      style={{
        ...styles.toast,
        ...toneStyle
      }}
      role={toast.tone === "error" || toast.tone === "danger" ? "alert" : "status"}
      aria-live={toast.tone === "error" || toast.tone === "danger" ? "assertive" : "polite"}
    >
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={styles.toastDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>,
    document.body
  );
}
