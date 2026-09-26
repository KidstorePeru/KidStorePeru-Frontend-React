import { useSyncExternalStore } from "react";

// One shared 1-second ticker for every countdown on the page (the shop page has
// ~150 item cards; each used to run its own interval and re-render the whole
// page every second).

function compute(): string {
  const next = new Date();
  next.setUTCHours(24, 0, 0, 0);
  const diff = Math.max(0, next.getTime() - Date.now());
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

let snapshot = compute();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    snapshot = compute();
    timer = setInterval(() => {
      snapshot = compute();
      listeners.forEach(l => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Time left until the shop rotates (00:00 UTC), as "HH:MM:SS". */
export default function useShopCountdown(): string {
  return useSyncExternalStore(subscribe, () => snapshot);
}
