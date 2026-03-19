import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pencil, Trash2, Mail, Calendar, User } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import { User as UserType } from "./type";

interface Props {
  users: UserType[];
  onDelete: (id: string) => void;
  onUpdate: (user: UserType) => void;
}

const ff = "'Manrope', sans-serif";

const avatarColors = [
  ["#8b5cf6", "#6d28d9"],
  ["#3b82f6", "#1d4ed8"],
  ["#ec4899", "#be185d"],
  ["#f59e0b", "#d97706"],
  ["#10b981", "#059669"],
  ["#ef4444", "#dc2626"],
];

const UsersTable: React.FC<Props> = ({ users, onDelete, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState<string>("");

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(t) ||
      (u.email?.toLowerCase().includes(t) ?? false)
    );
  }, [searchTerm, users]);

  const handleDelete = (id: string, username: string) => {
    setConfirmId(id);
    setConfirmName(username);
  };

  const handleConfirmDelete = () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    onDelete(confirmId);
    setConfirmId(null);
    setConfirmName("");
  };

  const getAvatarColors = (name: string) => {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  // Columnas: usuario | email | fecha | acciones
  // Acciones necesita 180px para los dos botones (73 + 84 + 6gap = 163px)
  const GRID = "1fr 1fr 110px 180px";

  return (
    <>
      {confirmId && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Seguro que quieres eliminar a "${confirmName}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar usuario"
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
          {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
          {searchTerm && ` · filtrado${filtered.length !== 1 ? "s" : ""}`}
        </span>
        <div style={{ position: "relative", minWidth: "200px" }}>
          <Search size={13} color="var(--text-muted)"
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text" placeholder="Buscar usuario..."
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
        {["Usuario", "Email", "Fecha", "Acciones"].map(h => (
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
            <User size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
            </p>
          </div>
        ) : (
          filtered.map((user, i) => {
            const [c1, c2] = getAvatarColors(user.username);
            const isDeleting = deletingId === user.id;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                style={{
                  display: "grid", gridTemplateColumns: GRID,
                  padding: "12px 20px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                {/* Usuario */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "#fff",
                    boxShadow: `0 2px 8px ${c1}55`,
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.username}
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>
                      ID: {user.id?.slice(0, 8)}…
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
                  {user.email ? (
                    <>
                      <Mail size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                  )}
                </div>

                {/* Fecha */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Calendar size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(user.createdAt).toLocaleDateString("es-PE")}
                  </span>
                </div>

                {/* Acciones — 180px es suficiente para Editar(73) + gap(6) + Eliminar(84) = 163px */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    onClick={() => onUpdate(user)}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "8px",
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      color: "var(--accent)", fontSize: "11px", fontWeight: 600,
                      cursor: "pointer", fontFamily: ff, transition: "all 0.15s",
                      whiteSpace: "nowrap" as const,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.22)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.1)"}
                  >
                    <Pencil size={11} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.username)}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "8px",
                      background: "var(--danger-bg)",
                      border: "1px solid var(--danger-border)",
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
            );
          })
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default UsersTable;
