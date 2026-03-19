import React, { useEffect, useState } from "react";
import { ShopEntry } from "../../pages/ProductsPage";

// Gradientes de fallback por rareza
const rarityGradients: Record<string, [string, string]> = {
  legendary:     ["#c87137", "#3d1508"],
  epic:          ["#6b35a8", "#1e0840"],
  rare:          ["#1a5cc0", "#071840"],
  uncommon:      ["#2a6a2a", "#0a200a"],
  common:        ["#4a4a5a", "#16161e"],
  marvel:        ["#a01818", "#300808"],
  dc:            ["#1020a0", "#060c38"],
  starwars:      ["#3a3a3a", "#101010"],
  icon:          ["#006080", "#001828"],
  gaming:        ["#3a1878", "#100828"],
  slurp:         ["#127878", "#042020"],
  shadow:        ["#282840", "#0c0c18"],
  lava:          ["#a02808", "#300c02"],
  frozen:        ["#1850b8", "#051030"],
};

const getGradient = (rarity: string): [string, string] => {
  const k = rarity.toLowerCase().replace(/[^a-z]/g, "");
  return rarityGradients[k]
    || Object.entries(rarityGradients).find(([key]) => k.includes(key))?.[1]
    || rarityGradients.common;
};

interface Props {
  item: ShopEntry;
  selected?: boolean;
  onClick?: (item: ShopEntry) => void;
}

const ItemCard: React.FC<Props> = ({ item, onClick }) => {
  const d = item.itemDisplay;
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const next = new Date(); next.setUTCHours(24, 0, 0, 0);
      const diff = next.getTime() - Date.now();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Los colores vienen de entry.colors con # prefijado desde ProductsPage
  // Ej: color1="#58a7f2ff", color2="#1e62f4ff", textBackgroundColor="#3752cfff"
  // Quitamos los últimos 2 chars del alpha para usar como hex limpio
  const clean = (c: string) => c?.length === 9 ? c.slice(0, 7) : c;

  const c1 = clean(d.color || d.backgroundColor || "");
  const c2 = clean(d.color2 || d.backgroundColor2 || "");
  const c3 = clean(d.color3 || "");
  const hasColors = c1.length === 7;

  const [fb1, fb2] = getGradient(d.rarity || "common");

  // Gradiente de fondo del card — igual al de la tienda oficial de Fortnite
  const bg1 = hasColors ? c1 : fb1;
  const bg2 = hasColors ? (c2 || c3 || c1) : fb2;
  const cardBg = `linear-gradient(160deg, ${bg1} 0%, ${bg2} 55%, #0d0d14 100%)`;
  const borderColor = hasColors ? c1 : fb1;

  return (
    <div
      onClick={() => onClick?.(item)}
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${borderColor}66`,
        background: cardBg,
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        fontFamily: "'Manrope', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-3px) scale(1.015)";
        el.style.boxShadow = `0 10px 28px ${borderColor}55`;
        el.style.borderColor = `${borderColor}cc`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0) scale(1)";
        el.style.boxShadow = "none";
        el.style.borderColor = `${borderColor}66`;
      }}
    >
      {/* Zona imagen */}
      <div style={{
        width: "100%",
        aspectRatio: "1",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Glowy center — imita el efecto de la tienda oficial */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 70% at 50% 65%, ${bg1}88 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}/>

        <img
          src={d.image}
          alt={d.name}
          loading="lazy"
          style={{
            position: "relative",
            zIndex: 1,
            width: "95%",
            height: "95%",
            objectFit: "contain",
            objectPosition: "center bottom",
            display: "block",
            // drop-shadow sutil que hace que el item "destaque" del fondo
            filter: `drop-shadow(0 4px 16px ${bg1}88)`,
          }}
        />

        {/* Badge rareza — arriba izquierda */}
        <div style={{
          position: "absolute",
          zIndex: 2,
          top: "7px",
          left: "7px",
          padding: "2px 8px",
          borderRadius: "5px",
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(6px)",
          fontSize: "9px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.95)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          maxWidth: "calc(100% - 14px)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {d.rarity}
        </div>

        {/* Timer — abajo derecha */}
        <div style={{
          position: "absolute",
          zIndex: 2,
          bottom: "6px",
          right: "6px",
          padding: "2px 6px",
          borderRadius: "5px",
          background: "rgba(0,0,0,0.70)",
          backdropFilter: "blur(4px)",
          fontSize: "9px",
          color: "rgba(255,255,255,0.85)",
          fontFamily: "monospace",
          letterSpacing: "0.02em",
        }}>
          ⏱{timeLeft}
        </div>
      </div>

      {/* Info inferior */}
      <div style={{
        padding: "8px 10px 10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)",
        backdropFilter: "blur(6px)",
      }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#ffffff",
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }} title={d.name}>
          {d.name}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            <img
              src="https://fortnite-api.com/images/vbuck.png"
              alt="V-Bucks"
              style={{ width: "13px", height: "13px" }}
            />
            <span style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#7dd3fc",
            }}>
              {d.vBucks.toLocaleString()}
            </span>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onClick?.(item); }}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(34,197,94,0.22)",
              border: "1px solid rgba(34,197,94,0.50)",
              color: "#4ade80",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
              transition: "background 0.15s",
              whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.42)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.22)"}
          >
            Regalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
