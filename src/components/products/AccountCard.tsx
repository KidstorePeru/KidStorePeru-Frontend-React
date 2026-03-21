import React, { useState } from "react";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { Account } from "../accounts";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../../App";
import GiftSlotStatusInline from "./GiftSlotStatusInline";

interface AccountCardProps {
  account: Account;
  selected?: boolean;
  onClick?: () => void;
  onRefresh?: () => void;
  handleAddPavos?: () => void;
  showGiftStatus?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account, selected, onClick, onRefresh, handleAddPavos, showGiftStatus = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const token = Cookies.get("session");

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation(); setIsLoading(true);
    try {
      await axios.post(`${API_URL}/refreshpavos`, { account_id: account.id },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      onRefresh?.();
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const hasPavos = account.pavos && account.pavos > 0;

  return (
    <div
      onClick={onClick}
      className="account-card"
      style={{
        position: "relative", cursor: "pointer", borderRadius: "16px", padding: "14px",
        minHeight: "160px", transition: "all 0.2s",
        background: selected ? "var(--accent-bg)" : "var(--bg-card)",
        border: selected ? "1px solid var(--card-border-selected)" : "1px solid var(--border)",
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }
      }}
    >
      {/* Botones top-right */}
      <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px", zIndex: 10 }}>
        <button
          onClick={e => { e.stopPropagation(); handleAddPavos?.(); }}
          style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--success-border)", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          title="Gestionar cuenta"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.2)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--success-bg)"}
        >
          <FiPlus style={{ color: "var(--success)", fontSize: "11px" }} />
        </button>
        <button
          onClick={handleRefresh} disabled={isLoading}
          style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: isLoading ? 0.4 : 1 }}
          title="Actualizar pavos"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"}
        >
          <FiRefreshCw className={isLoading ? "animate-spin" : ""} style={{ color: "var(--text-muted)", fontSize: "11px" }} />
        </button>
      </div>

      <div style={{ paddingTop: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, textAlign: "center", marginBottom: "8px", color: "var(--pink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.displayName}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px" }}>🪙</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: hasPavos ? "var(--gold)" : "var(--text-muted)" }}>
            {account.pavos?.toLocaleString() ?? "0"}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>pavos</span>
        </div>

        {showGiftStatus ? (
          <GiftSlotStatusInline
            giftSlotStatus={account.giftSlotStatus}
            accountId={account.id}  // ← clave: pasar el id para localStorage
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Enviados</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{5 - (account.remainingGifts ?? 0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Disponibles</span>
              <span style={{ fontWeight: 600, color: (account.remainingGifts ?? 5) > 0 ? "var(--success)" : "var(--warning)" }}>
                {account.remainingGifts ?? 5}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountCard;
