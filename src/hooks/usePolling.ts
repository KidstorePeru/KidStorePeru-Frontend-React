import { useEffect, useRef } from "react";

/**
 * Calls `fn` every `ms` while the tab is visible, and once as soon as the tab
 * becomes visible again if more than `ms` went by while it was hidden. The
 * latest `fn` is always used, so callers need no useCallback.
 */
export default function usePolling(fn: () => void, ms: number) {
  const latest = useRef(fn);
  latest.current = fn;

  useEffect(() => {
    let last = Date.now();
    const run = () => {
      if (document.visibilityState !== "visible") return;
      last = Date.now();
      latest.current();
    };
    const interval = setInterval(run, ms);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - last >= ms) run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ms]);
}
