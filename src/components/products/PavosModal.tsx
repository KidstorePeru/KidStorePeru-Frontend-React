import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../../App";
import { Account } from "../accounts";
import { X, Plus, Edit2, ChevronRight, Check } from "lucide-react";
import { saveManualGiftAdjust } from "./GiftSlotStatusInline";

interface PavosModalProps {
  account: Account;
  onClose: () => void;
  onRefresh?: () => void;
  onPavosUpdated?: (updated: {
    account_id: string; display_name: string;
    previous_pavos: number; new_pavos: number;
    operation: "add" | "override"; amount: number;
  }) => void;
}

type Tab = "pavos" | "gifts";
type Step = "menu" | "custom" | "edit" | "confirm";

const PavosModal: React.FC<PavosModalProps> = ({ account, onClose, onRefresh, onPavosUpdated }) => {
  const [tab, setTab] = useState<Tab>("pavos");
  const [step, setStep] = useState<Step>("menu");
  const [amount, setAmount] = useState("");
  const [opType, setOpType] = useState<"add" | "override">("add");
  const [finalAmount, setFinalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [giftOp, setGiftOp] = useState<"add" | "subtract" | "override">("subtract");
  const [giftAmount, setGiftAmount] = useState("1");
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftSuccess, setGiftSuccess] = useState("");
  const [giftError, setGiftError] = useState("");
  const [localGifts, setLocalGifts] = useState<number | null>(null);

  const token = Cookies.get("session");
  const ff = "'Manrope', sans-serif";
  const currentGifts = localGifts !== null ? localGifts : (account.remainingGifts ?? 5);

  const goConfirm = (type: "add" | "override", val: number) => {
    setOpType(type); setFinalAmount(val); setStep("confirm"); setError("");
  };

  const isAmountValid = (val: string, type: "add" | "override") => {
    if (val === "" || val === undefined) return false;
    const n = Number(val);
    if (!Number.isFinite(n)) return false;
    return type === "add" ? n > 0 : n >= 0;
  };

  const handleConfirmPavos = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.post(
        `${API_URL}/updatepavos`,
        { account_id: account.id, type: opType, amount: Number(finalAmount) },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        if (onPavosUpdated && res.data.data) onPavosUpdated(res.data.data);
        onRefresh?.();
        setSuccess(true);
        setTimeout(() => onClose(), 1400);
      } else {
        setError(res.data.error || "Error al actualizar");
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleGiftAdjust = async () => {
    const amt = parseInt(giftAmount);
    if (!amt || amt <= 0) return;
    setGiftLoading(true); setGiftSuccess(""); setGiftError("");
    try {
      const res = await axios.post(
        `${API_URL}/updateremaininggifts`,
        { account_id: account.id, type: giftOp, amount: amt },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const newVal = res.data.new_remaining;
        setGiftSuccess(`Actualizado: ${res.data.previous_remaining} → ${newVal} intentos`);
        setLocalGifts(newVal);
        // Guardar en localStorage para mostrar timer de 24h
        // Solo si se restaron intentos (no si se agregaron o fijaron a max)
        if (giftOp === "subtract" || (giftOp === "override" && newVal < 5)) {
          saveManualGiftAdjust(account.id);
        }
        onRefresh?.();
      } else {
        setGiftError(res.data.error || "Error al actualizar");
      }
    } catch (e: any) {
      setGiftError(e?.response?.data?.error || "Error de conexión");
    } finally {
      setGiftLoading(false);
    }
  };

  const previewTotal = opType === "add" ? account.pavos + finalAmount : finalAmount;

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    background: "var(--bg-input)", border: "1px solid var(--border)",
    color: "var(--text-primary)", fontSize: "14px", fontFamily: ff,
    outline: "none", marginBottom: "8px", transition: "border-color 0.15s",
  };
  const ghostBtn: React.CSSProperties = {
    padding: "11px", borderRadius: "10px", background: "transparent",
    border: "1px solid var(--border)", color: "var(--text-muted)",
    fontSize: "13px", cursor: "pointer", fontFamily: ff,
  };
  const sectionLbl: React.CSSProperties = {
    fontSize: "10px", fontWeight: 700, color: "var(--text-muted)",
    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px", backdropFilter: "blur(6px)", fontFamily: ff }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.18 }}
        style={{ background: "var(--bg-modal)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", maxWidth: "400px", width: "100%", transition: "background 0.25s, border-color 0.25s" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <p style={{ fontFamily: "'ReadexPro',sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Gestionar cuenta</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}><span style={{ color: "var(--pink)" }}>{account.displayName}</span></p>
          </div>
          <button onClick={onClose} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <X size={13} color="var(--text-muted)" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "6px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "12px", padding: "4px", marginBottom: "16px" }}>
          {([["pavos", "🪙 Pavos"], ["gifts", "🎁 Regalos"]] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setStep("menu"); setSuccess(false); setError(""); setGiftSuccess(""); setGiftError(""); }}
              style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "none", background: tab === t ? "var(--bg-surface)" : "transparent", color: tab === t ? "var(--text-primary)" : "var(--text-muted)", fontSize: "12px", fontWeight: tab === t ? 700 : 500, cursor: "pointer", fontFamily: ff, transition: "all 0.15s", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB PAVOS ── */}
        {tab === "pavos" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: step === "menu" ? "var(--accent)" : "var(--text-muted)", cursor: "pointer" }} onClick={() => setStep("menu")}>Inicio</span>
              {step !== "menu" && <><ChevronRight size={12} color="var(--text-muted)" /><span style={{ color: "var(--accent)" }}>{step === "confirm" ? "Confirmar" : step === "edit" ? "Editar total" : "Cantidad"}</span></>}
            </div>
            <p style={{ ...sectionLbl, marginBottom: "12px" }}>Pavos actuales: <span style={{ color: "var(--gold)", fontWeight: 700 }}>{account.pavos.toLocaleString()}</span></p>

            <AnimatePresence mode="wait">
              {step === "menu" && (
                <motion.div key="menu" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                  <p style={sectionLbl}>Agregar pavos</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                    {[1000, 2800, 5000, 13500].map(v => (
                      <button key={v} onClick={() => goConfirm("add", v)}
                        style={{ padding: "10px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: ff }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                        <Plus size={12} color="var(--accent)" /><span>+{v.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setAmount(""); setStep("custom"); }}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontFamily: ff, marginBottom: "10px" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    Otro monto...
                  </button>
                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0 10px" }} />
                  <p style={sectionLbl}>Establecer total</p>
                  <button onClick={() => { setAmount(account.pavos.toString()); setStep("edit"); }}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "transparent", border: "1px solid var(--warning-border)", color: "var(--warning)", fontSize: "13px", cursor: "pointer", fontFamily: ff, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--warning-bg)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <Edit2 size={13} /> Editar cantidad total
                  </button>
                </motion.div>
              )}

              {step === "custom" && (
                <motion.div key="custom" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                  <label style={sectionLbl}>¿Cuántos pavos agregar?</label>
                  <input type="number" min="1" autoFocus value={amount} onChange={e => setAmount(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && isAmountValid(amount, "add") && goConfirm("add", Number(amount))}
                    style={inp} placeholder="Ej: 5000"
                    onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                  {isAmountValid(amount, "add") && (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Nuevo total: <span style={{ color: "var(--success)", fontWeight: 700 }}>{(account.pavos + Number(amount)).toLocaleString()}</span>
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => goConfirm("add", Number(amount))} disabled={!isAmountValid(amount, "add")}
                      style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "var(--accent)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "'ReadexPro',sans-serif", cursor: "pointer", opacity: isAmountValid(amount, "add") ? 1 : 0.4 }}>
                      Continuar
                    </button>
                    <button onClick={() => setStep("menu")} style={{ ...ghostBtn, flex: 1 }}>Volver</button>
                  </div>
                </motion.div>
              )}

              {step === "edit" && (
                <motion.div key="edit" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                  <label style={sectionLbl}>Nueva cantidad total de pavos</label>
                  <input type="number" min="0" autoFocus value={amount} onChange={e => setAmount(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && isAmountValid(amount, "override") && goConfirm("override", Number(amount))}
                    style={{ ...inp, borderColor: "var(--warning-border)" }} placeholder="Nueva cantidad (puede ser 0)"
                    onFocus={e => (e.target.style.borderColor = "var(--warning)")}
                    onBlur={e => (e.target.style.borderColor = "var(--warning-border)")} />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Actual: <span style={{ color: "var(--gold)", fontWeight: 700 }}>{account.pavos.toLocaleString()}</span>
                    {" · "}<span style={{ color: "var(--text-muted)" }}>0 es válido</span>
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => goConfirm("override", Number(amount))} disabled={!isAmountValid(amount, "override")}
                      style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "var(--warning)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "'ReadexPro',sans-serif", cursor: "pointer", opacity: isAmountValid(amount, "override") ? 1 : 0.4 }}>
                      Continuar
                    </button>
                    <button onClick={() => setStep("menu")} style={{ ...ghostBtn, flex: 1 }}>Volver</button>
                  </div>
                </motion.div>
              )}

              {step === "confirm" && !success && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "18px", marginBottom: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>{opType === "add" ? "Agregar" : "Establecer en"}</p>
                    <p style={{ fontSize: "26px", fontWeight: 700, color: opType === "add" ? "var(--success)" : "var(--warning)", margin: "0 0 6px", fontFamily: "'ReadexPro',sans-serif" }}>
                      {opType === "add" ? "+" : ""}{finalAmount.toLocaleString()}
                    </p>
                    <div style={{ borderTop: "1px solid var(--border)", margin: "10px 0 8px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Antes</span>
                      <span style={{ color: "var(--gold)", fontWeight: 600 }}>{account.pavos.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Después</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{previewTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  {error && (
                    <div style={{ padding: "9px 12px", borderRadius: "8px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: "12px", marginBottom: "12px" }}>✗ {error}</div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleConfirmPavos} disabled={loading}
                      style={{ flex: 1, padding: "11px", borderRadius: "10px", background: opType === "add" ? "var(--success)" : "var(--warning)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "'ReadexPro',sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                      {loading ? "Guardando..." : "Confirmar"}
                    </button>
                    <button onClick={() => setStep("menu")} disabled={loading} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--success-bg)", border: "1px solid var(--success-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Check size={22} color="var(--success)" />
                  </div>
                  <p style={{ color: "var(--success)", fontWeight: 700, fontSize: "15px", fontFamily: "'ReadexPro',sans-serif" }}>¡Actualizado!</p>
                </motion.div>
              )}
            </AnimatePresence>
            {step === "menu" && !success && (
              <button onClick={onClose} style={{ ...ghostBtn, width: "100%", marginTop: "10px" }}>Cerrar</button>
            )}
          </>
        )}

        {/* ── TAB REGALOS ── */}
        {tab === "gifts" && (
          <div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 6px" }}>Intentos disponibles</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: currentGifts > 0 ? "var(--success)" : "var(--warning)", fontFamily: "'ReadexPro',sans-serif", transition: "color 0.2s" }}>
                  {currentGifts}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ 5</span>
                <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i < currentGifts ? "var(--success)" : "var(--border)", transition: "background 0.2s" }} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "6px 0 0" }}>
                Útil si enviaste un regalo directamente desde el juego
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {([
                ["subtract", "− Restar", "var(--danger)", "var(--danger-bg)", "var(--danger-border)"],
                ["add", "+ Agregar", "var(--success)", "var(--success-bg)", "var(--success-border)"],
                ["override", "= Fijar", "var(--accent)", "var(--accent-bg)", "var(--accent-border)"],
              ] as any[]).map(([op, label, color, bg, border]) => (
                <button key={op} onClick={() => setGiftOp(op)}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: "9px", background: giftOp === op ? bg : "transparent", border: `1px solid ${giftOp === op ? border : "var(--border)"}`, color: giftOp === op ? color : "var(--text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: ff }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input type="number" min="1" max="5" value={giftAmount} onChange={e => setGiftAmount(e.target.value)}
                style={{ ...inp, flex: 1, marginBottom: 0 }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              <button onClick={handleGiftAdjust} disabled={giftLoading}
                style={{ padding: "11px 18px", borderRadius: "10px", background: giftOp === "subtract" ? "var(--danger)" : giftOp === "add" ? "var(--success)" : "var(--accent)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "'ReadexPro',sans-serif", cursor: giftLoading ? "not-allowed" : "pointer", opacity: giftLoading ? 0.6 : 1, whiteSpace: "nowrap" as const }}>
                {giftLoading ? "..." : "Aplicar"}
              </button>
            </div>

            {giftSuccess && (
              <div style={{ padding: "9px 12px", borderRadius: "8px", background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)", fontSize: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={13} />{giftSuccess}
              </div>
            )}
            {giftError && (
              <div style={{ padding: "9px 12px", borderRadius: "8px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: "12px", marginBottom: "8px" }}>✗ {giftError}</div>
            )}
            <button onClick={onClose} style={{ ...ghostBtn, width: "100%", marginTop: "4px" }}>Cerrar</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PavosModal;
