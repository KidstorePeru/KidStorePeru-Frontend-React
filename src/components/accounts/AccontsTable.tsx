import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Gamepad2 } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import { Account } from "./types";
import GiftSlotStatusInline from "../products/GiftSlotStatusInline";

interface Props {
  accounts: Account[];
  onDelete: (id: string) => void;
  showGiftStatus?: boolean;
}

const ff = "'Manrope', sans-serif";

const AccountsTable: React.FC<Props> = ({ accounts, onDelete, showGiftStatus = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState<string>("");

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return accounts.filter(a => a.displayName.toLowerCase().includes(t));
  }, [searchTerm, accounts]);

  const handleDelete = (id: string, name: string) => {
    setConfirmId(id);
    setConfirmName(name);
  };

  const handleConfirmDelete = () => {
    if (!confirmId) return;
    onDelete(confirmId);
    setConfirmId(null);
    setConfirmName("");
  };

  // Botón Eliminar mide ~95px, darle 120px + padding izquierdo de separación
  const GRID = showGiftStatus ? "1fr 140px 1fr 120px" : "1fr 140px 140px 120px";

  return (
    <>
      {confirmId && (
        <ConfirmModal
          title="Eliminar cuenta"
          message={`¿Seguro que quieres desconectar "${confirmName}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar cuenta"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setConfirmId(null); setConfirmName(""); }}
        />
      )}
    <div style={{
      background: "var(--bg-modal)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      overflow: "hidden",
      fontFamily: ff,
      transition: "background 0.25s, border-color 0.25s",
    }}>
      {/* Barra superior */}
      <div style={{
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        gap: "12px", flexWrap: "wrap" as const,
      }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
          {filtered.length} cuenta{filtered.length !== 1 ? "s" : ""}
          {searchTerm && " · filtradas"}
        </span>
        <div style={{ position: "relative", minWidth: "200px" }}>
          <Search size={13} color="var(--text-muted)"
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text" placeholder="Buscar cuenta..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            autoComplete="off"
            style={{
              width: "100%", padding: "8px 12px 8px 32px", borderRadius: "9px",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "12px", fontFamily: ff,
              outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* Cabecera */}
      <div style={{
        display: "grid", gridTemplateColumns: GRID,
        padding: "10px 20px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
      }}>
        {["Nombre", "Pavos", showGiftStatus ? "Estado Regalos" : "Regalos", "Acciones"].map(h => (
          <span key={h} style={{
            fontSize: "10px", fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{h}</span>
        ))}
      </div>

      {/* Filas */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Gamepad2 size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              {searchTerm ? "No se encontraron cuentas" : "No hay cuentas registradas"}
            </p>
          </div>
        ) : (
          filtered.map((acc, i) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, delay: i * 0.02 }}
              style={{
                display: "grid", gridTemplateColumns: GRID,
                padding: "12px 20px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              {/* Nombre */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#fff",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
                }}>
                  {acc.displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {acc.displayName}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>
                    ID: {acc.id?.slice(0, 8)}…
                  </p>
                </div>
              </div>

              {/* Pavos */}
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "14px" }}>🪙</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fbbf24" }}>
                  {(acc.pavos ?? 0).toLocaleString()}
                </span>
              </div>

              {/* Estado regalos */}
              {showGiftStatus ? (
                <div style={{ paddingRight: "12px" }}>
                  <GiftSlotStatusInline
                    giftSlotStatus={acc.giftSlotStatus}
                    remainingGiftsOverride={acc.remainingGifts}
                    accountId={acc.id}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "14px" }}>🎁</span>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {acc.remainingGifts}
                  </span>
                </div>
              )}

              {/* Acciones — paddingLeft para separarse del contenido de regalos */}
              <div style={{ paddingLeft: "12px" }}>
                <button
                  onClick={() => handleDelete(acc.id, acc.displayName)}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 12px", borderRadius: "8px",
                    background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
                    color: "var(--danger)", fontSize: "11px", fontWeight: 600,
                    cursor: "pointer", fontFamily: ff, transition: "all 0.15s",
                    whiteSpace: "nowrap" as const,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--danger-bg)"}
                >
                  <Trash2 size={11} /> Eliminar
                </button>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default AccountsTable;
