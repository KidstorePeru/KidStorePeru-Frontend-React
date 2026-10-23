import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Warns that a linked account has no permanent Epic credentials: it only works
 * while Epic keeps its refresh token, and may ask to be linked again (for
 * example after the account signs in to the game).
 */
const DeviceAuthBadge: React.FC<{ deviceAuth?: boolean }> = ({ deviceAuth }) => {
  if (deviceAuth !== false) return null;
  return (
    <span
      title="Esta cuenta se vinculó sin credenciales permanentes: si entras al juego con ella, Epic puede cerrar su vínculo y tendrás que vincularla de nuevo. Vincúlala otra vez desde «Cuentas Fortnite» para dejarla estable."
      style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, color: "var(--warning)", cursor: "help" }}
    >
      <AlertTriangle size={10} /> Vínculo temporal
    </span>
  );
};

export default DeviceAuthBadge;
