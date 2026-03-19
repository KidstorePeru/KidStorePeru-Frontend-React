import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
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
      {dark
        ? <Sun size={17} color="#FCD34D" />
        : <Moon size={17} color="#6366F1" />
      }
    </button>
  );
};

export default ThemeToggle;
