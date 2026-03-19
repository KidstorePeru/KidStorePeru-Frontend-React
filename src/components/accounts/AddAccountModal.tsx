import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../../App";
import { X, Link, CheckCircle, AlertCircle, ExternalLink, Copy, Check } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const ff = "'Manrope', sans-serif";

const AddAccountModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const handleInit = async () => {
    setStatus("loading");
    try {
      const token = Cookies.get("session");
      const res = await axios.post(`${API_URL}/connectfaccount`, {},
        { headers: { Authorization: `Bearer ${token}` } });

      if (res.status === 200 && res.data.success && res.data.verification_uri_complete && res.data.device_code) {
        setUserCode(res.data.user_code);
        setDeviceCode(res.data.device_code);
        setStatus("idle");
        setStep(2);
        setTimeout(() => window.open(res.data.verification_uri_complete, "_blank"), 800);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Init failed:", err);
      setStatus("error");
    }
  };

  const handleDeviceSync = async () => {
    if (!deviceCode) return;
    setStatus("loading");
    try {
      const token = Cookies.get("session");
      const res = await axios.post(`${API_URL}/finishconnectfaccount`,
        { device_code: deviceCode },
        { headers: { Authorization: `Bearer ${token}` } });

      if (res.status === 200) {
        setStatus("success");
        setTimeout(() => { onSuccess(); onClose(); }, 1200);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Device sync failed:", err);
      setStatus("error");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: "16px", backdropFilter: "blur(6px)", fontFamily: ff,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          background: "var(--bg-modal)", border: "1px solid var(--border)",
          borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%",
          position: "relative", fontFamily: ff,
        }}
      >
        {/* Cerrar */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "5px", cursor: "pointer",
          display: "flex", alignItems: "center",
        }}>
          <X size={13} color="var(--text-muted)" />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
          }}>
            <Link size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'ReadexPro', sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Vincular cuenta Fortnite
            </h2>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
              Paso {step} de 2
            </p>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {[1, 2].map(n => (
            <div key={n} style={{
              flex: 1, height: "3px", borderRadius: "2px",
              background: step >= n ? "#3b82f6" : "var(--border)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Pasos informativos */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {[
                  { n: "1", text: "Haz clic en \"Iniciar vinculación\"" },
                  { n: "2", text: "Se abrirá la página de Epic Games" },
                  { n: "3", text: "Inicia sesión y autoriza la cuenta" },
                  { n: "4", text: "Vuelve aquí y confirma" },
                ].map(({ n, text }) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                      background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, color: "#60a5fa",
                    }}>{n}</div>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleInit}
                disabled={status === "loading"}
                style={{
                  width: "100%", padding: "13px",
                  borderRadius: "10px",
                  background: status === "error" ? "var(--danger-bg)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  border: status === "error" ? "1px solid var(--danger-border)" : "none",
                  color: status === "error" ? "var(--danger)" : "#fff",
                  fontSize: "14px", fontWeight: 600, fontFamily: ff,
                  cursor: status === "loading" ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "opacity 0.15s",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? (
                  "Iniciando..."
                ) : status === "error" ? (
                  <><AlertCircle size={15} /> Error — intentar de nuevo</>
                ) : (
                  <><ExternalLink size={15} /> Iniciar vinculación</>
                )}
              </button>

              <button onClick={onClose} style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "10px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: ff }}>
                Cancelar
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", textAlign: "center" }}>
                Ingresa este código en la página de Epic Games que se abrió:
              </p>

              {/* Código de usuario */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "12px", marginBottom: "20px",
              }}>
                <span style={{
                  fontFamily: "monospace", fontSize: "28px", fontWeight: 700,
                  color: "var(--text-primary)", letterSpacing: "0.15em",
                  flex: 1, textAlign: "center",
                }}>
                  {userCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Copiar código"
                  style={{
                    width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
                    background: copied ? "rgba(34,197,94,0.15)" : "var(--bg-modal)",
                    border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} color="var(--text-muted)" />}
                </button>
              </div>

              {/* Estado del botón de confirmar */}
              <button
                onClick={handleDeviceSync}
                disabled={status === "loading" || status === "success"}
                style={{
                  width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                  fontSize: "14px", fontWeight: 600, fontFamily: ff,
                  cursor: status === "loading" || status === "success" ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s",
                  background: status === "success"
                    ? "rgba(34,197,94,0.15)"
                    : status === "error"
                    ? "var(--danger-bg)"
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: status === "success" ? "#4ade80"
                    : status === "error" ? "var(--danger)"
                    : "#fff",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "Verificando..." :
                 status === "success" ? <><CheckCircle size={15} /> ¡Cuenta vinculada!</> :
                 status === "error" ? <><AlertCircle size={15} /> Error — reintentar</> :
                 <><CheckCircle size={15} /> Ya inicié sesión</>}
              </button>

              <button onClick={onClose} style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "10px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: ff }}>
                Cancelar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AddAccountModal;
