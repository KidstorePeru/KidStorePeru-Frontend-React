import React, { useState, useEffect } from "react";
import { GiftSlotStatus } from "../accounts/types";

interface Props {
  giftSlotStatus?: GiftSlotStatus;
  remainingGiftsOverride?: number;
  accountId?: string;
}

export const saveManualGiftAdjust = (_accountId: string) => {};

const formatDiff = (diff: number): string => {
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
};

const GiftSlotStatusInline: React.FC<Props> = ({ giftSlotStatus, remainingGiftsOverride }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!giftSlotStatus && remainingGiftsOverride === undefined) {
    return <div style={{ color:"var(--text-muted)", fontSize:"11px", textAlign:"center" }}>—</div>;
  }

  const remaining = remainingGiftsOverride !== undefined
    ? remainingGiftsOverride
    : (giftSlotStatus?.remaining_gifts ?? 5);
  const maxGifts = giftSlotStatus?.max_gifts ?? 5;
  const usedGifts = giftSlotStatus?.used_gifts ?? (maxGifts - remaining);
  const isAvailable = remaining > 0;

  // Timers individuales por slot usado
  const slotTimers: string[] = [];
  if (giftSlotStatus?.slot_expiry_times?.length) {
    for (const expiryISO of giftSlotStatus.slot_expiry_times) {
      const diff = new Date(expiryISO).getTime() - Date.now();
      if (diff > 0) slotTimers.push(formatDiff(diff));
    }
  } else if (giftSlotStatus?.next_slot_available) {
    const diff = new Date(giftSlotStatus.next_slot_available).getTime() - Date.now();
    if (diff > 0) slotTimers.push(formatDiff(diff));
  }

  const nextTimer = slotTimers.length > 0 ? slotTimers[0] : "";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>

      {/* Fila: slots + usados */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <span style={{ fontSize:"11px" }}>🎁</span>
          <span style={{ fontSize:"12px", fontWeight:600,
            color: isAvailable ? "var(--success)" : "var(--warning)" }}>
            {remaining}/{maxGifts}
          </span>
        </div>
        <span style={{ fontSize:"10px", color:"var(--text-secondary)" }}>
          {usedGifts} usados
        </span>
      </div>

      {/* Pips */}
      <div style={{ display:"flex", gap:"3px" }}>
        {Array.from({ length: maxGifts }, (_, i) => (
          <div key={i} style={{
            flex:1, height:"5px", borderRadius:"3px",
            background: i < remaining
              ? isAvailable ? "var(--success)" : "var(--warning)"
              : "var(--border-strong)",
            transition:"background 0.3s",
          }}/>
        ))}
      </div>

      {/* Timers individuales */}
      {slotTimers.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
          {slotTimers.map((t, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:"5px",
              background:"var(--bg-input)",
              border:"1px solid var(--border)",
              borderRadius:"5px",
              padding:"2px 6px",
            }}>
              <div style={{
                width:"5px", height:"5px", borderRadius:"50%", flexShrink:0,
                background:"var(--warning)",
              }}/>
              <span style={{
                fontSize:"10px",
                color:"var(--text-secondary)",
                fontFamily:"monospace",
                letterSpacing:"0.02em",
              }}>
                {t}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Badge estado */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:"5px",
        padding:"3px 8px", borderRadius:"6px", alignSelf:"flex-start",
        background: isAvailable ? "var(--success-bg)" : "var(--warning-bg)",
        border:`1px solid ${isAvailable ? "var(--success-border)" : "var(--warning-border)"}`,
      }}>
        <div style={{
          width:"5px", height:"5px", borderRadius:"50%", flexShrink:0,
          background: isAvailable ? "var(--success)" : "var(--warning)",
        }}/>
        <span style={{
          fontSize:"10px", fontWeight:600,
          color: isAvailable ? "var(--success)" : "var(--warning)",
        }}>
          {isAvailable ? "Listo" : nextTimer ? `Espera ${nextTimer}` : "Sin slots"}
        </span>
      </div>

    </div>
  );
};

export default GiftSlotStatusInline;
