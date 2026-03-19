import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ff = "'Manrope', sans-serif";

const ConfirmModal: React.FC<Props> = ({
  title, message, confirmLabel = "Eliminar", onConfirm, onCancel
}) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: "16px", backdropFilter: "blur(6px)", fontFamily: ff,
  }}
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={e => e.stopPropagation()}
      style={{
        background: "var(--bg-modal)", border: "1px solid var(--border)",
        borderRadius: "18px", padding: "24px", maxWidth: "380px", width: "100%",
        position: "relative", fontFamily: ff,
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      {/* Cerrar */}
      <button onClick={onCancel} style={{
        position: "absolute", top: "14px", right: "14px",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "8px", padding: "4px", cursor: "pointer",
        display: "flex", alignItems: "center",
      }}>
        <X size={13} color="var(--text-muted)" />
      </button>

      {/* Ícono */}
      <div style={{
        width: "46px", height: "46px", borderRadius: "13px",
        background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "16px",
      }}>
        <AlertTriangle size={22} color="var(--danger)" />
      </div>

      {/* Texto */}
      <h2 style={{
        fontFamily: "'ReadexPro', sans-serif", fontSize: "16px",
        fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px",
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: "13px", color: "var(--text-secondary)",
        margin: "0 0 22px", lineHeight: 1.55,
      }}>
        {message}
      </p>

      {/* Botones */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: "10px", borderRadius: "10px",
          background: "transparent", border: "1px solid var(--border)",
          color: "var(--text-muted)", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", fontFamily: ff, transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          Cancelar
        </button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: "10px", borderRadius: "10px",
          background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
          color: "var(--danger)", fontSize: "13px", fontWeight: 700,
          cursor: "pointer", fontFamily: ff, transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--danger-bg)"}
        >
          {confirmLabel}
        </button>
      </div>
    </motion.div>
  </div>
);

export default ConfirmModal;
