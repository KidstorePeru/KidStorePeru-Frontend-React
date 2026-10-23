import { useEffect, useRef } from "react";

/** Runs `onEscape` when the Escape key is pressed (used to close modals). */
export default function useEscapeKey(onEscape: () => void) {
  const latest = useRef(onEscape);
  latest.current = onEscape;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") latest.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
