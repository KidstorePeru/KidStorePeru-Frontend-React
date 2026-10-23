import React, { useState, useEffect, useRef } from "react";
import { GiftSlotStatus } from "../accounts/types";

interface Props {
  giftSlotStatus?: GiftSlotStatus;
  remainingGiftsOverride?: number;
  /**
   * Called once for every slot whose timer reaches zero, so the parent can
   * reload the real state from the server instead of waiting for its next
   * periodic refresh.
   */
  onSlotFreed?: () => void;
}

const formatDiff = (diff: number): string => {
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
};

/** Wait a moment after a timer ends so the server's clock has certainly passed it too. */
const FREED_GRACE_MS = 1500;

const GiftSlotStatusInline: React.FC<Props> = ({ giftSlotStatus, remainingGiftsOverride, onSlotFreed }) => {
  // Forces a re-render every second so the countdown timers stay live, and
  // notices the slots whose timer just ran out.
  const [, setTick] = useState(0);
  const notified = useRef<Set<string>>(new Set());
  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      if (!onSlotFreed || !giftSlotStatus?.slot_expiry_times?.length) return;
      const now = Date.now();
      let freed = false;
      for (const iso of giftSlotStatus.slot_expiry_times) {
        if (new Date(iso).getTime() + FREED_GRACE_MS <= now && !notified.current.has(iso)) {
          notified.current.add(iso);
          freed = true;
        }
      }
      if (freed) onSlotFreed();
    }, 1000);
    return () => clearInterval(iv);
  }, [giftSlotStatus, onSlotFreed]);

  if (!giftSlotStatus && remainingGiftsOverride === undefined) {
    return <div style={{ color:"var(--text-muted)", fontSize:"11px", textAlign:"center" }}>—</div>;
  }

  const maxGifts = giftSlotStatus?.max_gifts ?? 5;
  const now = Date.now();

  // Expiry time of every used slot, soonest first.
  let expiries = (giftSlotStatus?.slot_expiry_times ?? [])
    .map(iso => new Date(iso).getTime())
    .filter(t => !Number.isNaN(t))
    .sort((a, b) => a - b);
  if (!expiries.length && giftSlotStatus?.next_slot_available) {
    const t = new Date(giftSlotStatus.next_slot_available).getTime();
    if (!Number.isNaN(t)) expiries = [t];
  }
  const running = expiries.filter(t => t > now);
  // Slots that freed up after this data was loaded: the server's count is
  // already out of date for them.
  const expired = expiries.length - running.length;

  const baseRemaining = remainingGiftsOverride !== undefined
    ? remainingGiftsOverride
    : (giftSlotStatus?.remaining_gifts ?? maxGifts);
  const remaining = Math.min(maxGifts, baseRemaining + expired);
  const usedGifts = maxGifts - remaining;
  const isAvailable = remaining > 0;

  // Timers individuales por slot usado
  const slotTimers = running.map(t => formatDiff(t - now));

  // With every slot busy, the next one frees when the running timers drop below
  // the maximum: the oldest one normally, a later one if there are extra rows.
  const nextTimer = !isAvailable && running.length > 0
    ? formatDiff(running[Math.max(0, running.length - maxGifts)] - now)
    : "";

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
