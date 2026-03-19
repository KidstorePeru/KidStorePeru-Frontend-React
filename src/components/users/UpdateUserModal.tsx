import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Pencil, User, Mail, Lock } from "lucide-react";
import { User as UserType } from "./type";

interface Props {
  user: UserType;
  onClose: () => void;
  onUpdate: (user: Partial<UserType>) => void;
}

const ff = "'Manrope', sans-serif";

const UpdateUserModal: React.FC<Props> = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password || "");

  useEffect(() => {
    setUsername(user.username);
    setEmail(user.email);
    setPassword(user.password || "");
  }, [user]);

  const handleSubmit = () => {
    if (!username.trim()) return;
    onUpdate({ id: user.id, username, email, password });
    onClose();
  };

  const fields = [
    { icon: <User size={13} />, placeholder: "Nombre de usuario", value: username, onChange: setUsername, type: "text" },
    { icon: <Mail size={13} />, placeholder: "Email (opcional)", value: email, onChange: setEmail, type: "email" },
    { icon: <Lock size={13} />, placeholder: "Nueva contraseña (opcional)", value: password, onChange: setPassword, type: "password" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px", backdropFilter: "blur(6px)", fontFamily: ff }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ background: "var(--bg-modal)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", maxWidth: "400px", width: "100%", position: "relative", fontFamily: ff }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "5px", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <X size={13} color="var(--text-muted)" />
        </button>

        {/* Header con avatar del usuario */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily: "'ReadexPro', sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Editar usuario</h2>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>@{user.username}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {fields.map(({ icon, placeholder, value, onChange, type }) => (
            <div key={placeholder} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                {icon}
              </div>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                autoComplete="off"
                style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: "9px", background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "13px", fontFamily: ff, outline: "none", transition: "border-color 0.15s" }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: ff }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!username.trim()}
            style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "var(--accent)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: !username.trim() ? "not-allowed" : "pointer", fontFamily: ff, opacity: !username.trim() ? 0.5 : 1, transition: "opacity 0.15s" }}
          >
            Guardar cambios
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdateUserModal;
