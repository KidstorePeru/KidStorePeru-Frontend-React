import React from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface Props {
  type: "error" | "ok";
  text: string;
  onClose?: () => void;
}

/** Inline message for the outcome of an action (shown above a table or form). */
const Notice: React.FC<Props> = ({ type, text, onClose }) => {
  const error = type === "error";
  return (
    <div role={error ? "alert" : "status"} style={{
      display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px",
      marginBottom: "14px", fontSize: "13px", fontFamily: "'Manrope', sans-serif",
      background: error ? "var(--danger-bg)" : "var(--success-bg)",
      border: `1px solid ${error ? "var(--danger-border)" : "var(--success-border)"}`,
      color: error ? "var(--danger)" : "var(--success)",
    }}>
      {error ? <AlertTriangle size={15} style={{ flexShrink: 0 }} /> : <CheckCircle size={15} style={{ flexShrink: 0 }} />}
      <span style={{ flex: 1, lineHeight: 1.4 }}>{text}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Cerrar aviso" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "inherit" }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Notice;
