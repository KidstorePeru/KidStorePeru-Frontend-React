import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

interface Props {
  /**
   * Inside the sidebar: a normal menu-style row (with a label when the sidebar
   * is open). Without it the toggle floats at the top right, which is only used
   * on screens that have no sidebar (the login) so it never covers page buttons.
   */
  inline?: boolean;
  /** Inline only: whether to show the text label next to the icon. */
  showLabel?: boolean;
}

const ThemeToggle: React.FC<Props> = ({ inline = false, showLabel = true }) => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro";
  const icon = dark ? <Sun size={17} color="#FCD34D" /> : <Moon size={17} color="#6366F1" />;

  if (inline) {
    return (
      <button
        onClick={toggleTheme}
        title={label}
        aria-label={label}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          justifyContent: showLabel ? "flex-start" : "center",
          padding: showLabel ? "9px 11px" : "9px", marginBottom: "6px",
          borderRadius: "10px", background: "transparent", border: "1px solid var(--border)",
          cursor: "pointer", transition: "background 0.15s",
          fontFamily: "'Manrope', sans-serif",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
      >
        <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
        {showLabel && (
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {dark ? "Tema claro" : "Tema oscuro"}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 100,
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
        border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = dark
          ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
        (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = dark
          ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
      }}
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;
