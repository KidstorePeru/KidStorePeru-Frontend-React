import React from "react";
import { Users } from "lucide-react";
import { Account } from "./types";

type Props = { account: Pick<Account, "friendsCount" | "friendsMax" | "friendsFull">; compact?: boolean };

/** Friend-list usage of a linked account: green while there is room, amber when
 *  nearly full and red when it cannot accept more friends. */
const FriendsBadge: React.FC<Props> = ({ account, compact }) => {
  const { friendsCount: count, friendsMax: max, friendsFull: full } = account;
  const known = typeof count === "number";
  const ratio = known && max ? count / max : 0;
  const level: "full" | "warn" | "ok" | "unknown" =
    full ? "full" : !known ? "unknown" : ratio >= 0.9 ? "warn" : "ok";

  const color = { full: "var(--danger)", warn: "var(--warning)", ok: "var(--success)", unknown: "var(--text-muted)" }[level];
  const text = known ? `${count.toLocaleString()}${max ? `/${max.toLocaleString()}` : ""}` : "—";
  const title = full
    ? "Amigos al máximo: no acepta más solicitudes hasta que elimines amigos"
    : known
      ? `${count} amigos${max ? ` de ${max}` : ""}${level === "warn" ? " (casi lleno)" : ""}`
      : "Cantidad de amigos aún sin leer desde Epic";

  return (
    <span title={title} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: compact ? "11px" : "12px", color }}>
      <Users size={compact ? 11 : 12} />
      <span style={{ fontWeight: 600 }}>{text}</span>
      {full && (
        <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "6px",
          background: "var(--danger-bg, rgba(239,68,68,0.12))", border: "1px solid var(--danger-border, rgba(239,68,68,0.35))" }}>
          LLENO
        </span>
      )}
    </span>
  );
};

export default FriendsBadge;
