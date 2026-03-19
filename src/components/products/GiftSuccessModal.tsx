import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

interface GiftInfo {
  giftName: string;
  giftPrice: number;
  giftImage: string;
  receiverName: string;
  senderName: string;
}
interface Props {
  giftInfo: GiftInfo;
  sentAt?: string;
  onClose: () => void;
}

const ff = "'Manrope', sans-serif";

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => res(img); img.onerror = rej; img.src = src;
  });
}

async function generateCardImage(
  giftInfo: GiftInfo,
  transactionId: string,
  fechaCapitalized: string,
  hora: string,
  sentDate: Date,
  accentColor: string,
): Promise<Blob> {

  const [itemImg, vbImg] = await Promise.all([
    loadImg(giftInfo.giftImage),
    loadImg("https://fortnite-api.com/images/vbuck.png"),
  ]);

  // ── Escala 3x para HD real ──
  // Dibujamos en coordenadas lógicas de 400px, el canvas tiene 1200px reales
  const S = 3;
  const W = 400;

  const ITEM_SIZE = 190;
  const HEADER_H = 56;
  const IMG_ZONE_H = ITEM_SIZE + 36;
  const NAME_ZONE_H = 76;
  const DATA_H = 12 + 4 * 32 + 12;
  const FOOTER_H = 36;
  const TOTAL_H = HEADER_H + IMG_ZONE_H + NAME_ZONE_H + DATA_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = TOTAL_H * S;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(S, S); // Todo se dibuja a escala lógica — canvas guarda 3x la resolución

  // ── Fondo ──
  ctx.fillStyle = "#0d1117";
  ctx.beginPath(); ctx.roundRect(0, 0, W, TOTAL_H, 20); ctx.fill();

  // ── Header ──
  const hg = ctx.createLinearGradient(0, 0, W * 0.65, 0);
  hg.addColorStop(0, accentColor + "35"); hg.addColorStop(1, "#111827");
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.roundRect(0, 0, W, HEADER_H, [20, 20, 0, 0]); ctx.fill();
  ctx.strokeStyle = accentColor + "30"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(W, HEADER_H); ctx.stroke();

  // Emoji circle
  ctx.fillStyle = accentColor + "22";
  ctx.beginPath(); ctx.arc(28, HEADER_H / 2, 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = accentColor + "55"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(28, HEADER_H / 2, 14, 0, Math.PI * 2); ctx.stroke();
  ctx.font = "15px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.fillText("🎁", 28, HEADER_H / 2);

  // Texto header — Manrope cargada en el documento
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accentColor; ctx.font = "700 13px Manrope, system-ui";
  ctx.fillText("Regalo enviado", 50, HEADER_H / 2 - 4);
  ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "400 10px Manrope, system-ui";
  ctx.fillText("KidStore Peru", 50, HEADER_H / 2 + 11);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.font = "400 9px Manrope";
  ctx.fillText("ID", W - 14, HEADER_H / 2 - 4);
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "700 10px monospace";
  ctx.fillText(transactionId, W - 14, HEADER_H / 2 + 11);

  // ── Zona imagen ──
  let y = HEADER_H;
  const ig = ctx.createLinearGradient(0, y, 0, y + IMG_ZONE_H);
  ig.addColorStop(0, "#1c2130"); ig.addColorStop(1, "#0d1117");
  ctx.fillStyle = ig; ctx.fillRect(0, y, W, IMG_ZONE_H);
  const glow = ctx.createRadialGradient(W / 2, y + IMG_ZONE_H * 0.6, 0, W / 2, y + IMG_ZONE_H * 0.6, 130);
  glow.addColorStop(0, accentColor + "15"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, y, W, IMG_ZONE_H);
  ctx.drawImage(itemImg, (W - ITEM_SIZE) / 2, y + 18, ITEM_SIZE, ITEM_SIZE);
  y += IMG_ZONE_H;

  // ── Nombre — ReadexPro 700 ──
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff"; ctx.font = "700 18px ReadexPro, Manrope, system-ui";
  let nameText = giftInfo.giftName;
  while (ctx.measureText(nameText).width > W - 40 && nameText.length > 4) nameText = nameText.slice(0, -1);
  if (nameText !== giftInfo.giftName) nameText += "…";
  ctx.fillText(nameText, W / 2, y + 24);

  // Price badge
  ctx.font = "700 13px Manrope, system-ui";
  const pl = `${giftInfo.giftPrice.toLocaleString()} V-Bucks`;
  const pw = ctx.measureText(pl).width + 48;
  const bx = (W - pw) / 2, by = y + 32, bh = 28;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath(); ctx.roundRect(bx, by, pw, bh, 14); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.roundRect(bx, by, pw, bh, 14); ctx.stroke();
  ctx.drawImage(vbImg, bx + 12, by + 7, 13, 13);
  ctx.fillStyle = "#7dd3fc"; ctx.textAlign = "left";
  ctx.fillText(pl, bx + 30, by + 19);
  y += NAME_ZONE_H;

  // ── Separador ──
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(W - 16, y); ctx.stroke();
  y += 12;

  // ── Filas de datos ──
  const rows = [
    { icon: "👤", label: "PARA",  value: giftInfo.receiverName, color: "#c084fc" },
    { icon: "🎮", label: "DE",    value: giftInfo.senderName,   color: "#60a5fa" },
    { icon: "📅", label: "FECHA", value: fechaCapitalized,      color: "#86efac" },
    { icon: "⏰", label: "HORA",  value: hora,                  color: "#fbbf24" },
  ];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    ctx.font = "12px serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff"; ctx.fillText(r.icon, 16, y + 16);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "700 10px Manrope, system-ui";
    ctx.fillText(r.label, 34, y + 16);
    ctx.textAlign = "right"; ctx.fillStyle = r.color; ctx.font = "700 12px Manrope, system-ui";
    let v = r.value;
    while (ctx.measureText(v).width > W - 120 && v.length > 4) v = v.slice(0, -1);
    if (v !== r.value) v += "…";
    ctx.fillText(v, W - 16, y + 16);
    y += 32;
    if (i < rows.length - 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(W - 16, y); ctx.stroke();
    }
  }
  y += 12;

  // ── Footer ──
  ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(W - 16, y); ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "10px monospace";
  ctx.fillText(`kidstore.pe  ·  ${hora}  ·  ${sentDate.toLocaleDateString("es-PE")}`, W / 2, y + 18);

  return new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png")
  );
}

const GiftSuccessModal: React.FC<Props> = ({ giftInfo, sentAt, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const sentDate = sentAt ? new Date(sentAt) : new Date();
  const fecha = sentDate.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const hora = sentDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fechaCapitalized = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const transactionId = `KS-${sentDate.getTime().toString(36).toUpperCase().slice(-8)}`;
  const accentColor = giftInfo.giftPrice >= 2000 ? "#f59e0b" : giftInfo.giftPrice >= 1000 ? "#a78bfa" : "#22c55e";

  const handleCopyAsImage = async () => {
    if (copying) return;
    setCopying(true);
    try {
      const blob = await generateCardImage(giftInfo, transactionId, fechaCapitalized, hora, sentDate, accentColor);
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true); setTimeout(() => setCopied(false), 3000);
      } catch {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `regalo-${giftInfo.receiverName}-${transactionId}.png`;
        a.click(); URL.revokeObjectURL(url);
        setCopied(true); setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) { console.error("Error:", err); }
    finally { setCopying(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px", fontFamily: ff }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <X size={14} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* ═══ CARD VISUAL (idéntico al canvas) ═══ */}
        <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg, ${accentColor}28 0%, #111827 100%)`, borderBottom: `1px solid ${accentColor}30`, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `${accentColor}20`, border: `1px solid ${accentColor}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🎁</div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: accentColor, margin: 0 }}>Regalo enviado</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.38)", margin: 0 }}>KidStore Peru</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", margin: 0 }}>ID</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", fontFamily: "monospace", margin: 0 }}>{transactionId}</p>
            </div>
          </div>

          <div style={{ padding: "18px 20px 8px", display: "flex", justifyContent: "center", background: "linear-gradient(180deg,#1c2130,#0d1117)" }}>
            <img src={giftInfo.giftImage} alt={giftInfo.giftName} crossOrigin="anonymous"
              style={{ width: "190px", height: "190px", objectFit: "contain", display: "block" }} />
          </div>

          <div style={{ padding: "4px 16px 12px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", fontFamily: "'ReadexPro',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {giftInfo.giftName}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 14px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img src="https://fortnite-api.com/images/vbuck.png" crossOrigin="anonymous" style={{ width: "13px", height: "13px", display: "block" }} alt="vb" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#7dd3fc" }}>{giftInfo.giftPrice.toLocaleString()} V-Bucks</span>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 16px" }} />

          <div style={{ padding: "10px 16px 8px", display: "flex", flexDirection: "column" }}>
            {[
              { icon: "👤", label: "PARA",  value: giftInfo.receiverName, color: "#c084fc" },
              { icon: "🎮", label: "DE",    value: giftInfo.senderName,   color: "#60a5fa" },
              { icon: "📅", label: "FECHA", value: fechaCapitalized,      color: "#86efac" },
              { icon: "⏰", label: "HORA",  value: hora,                  color: "#fbbf24" },
            ].map(({ icon, label, value, color }, i, arr) => (
              <div key={label}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px" }}>{icon}</span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.07em" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: "11px", color, fontWeight: 600, textAlign: "right", maxWidth: "210px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginLeft: "8px" }}>{value}</span>
                </div>
                {i < arr.length - 1 && <div style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />}
              </div>
            ))}
          </div>

          <div style={{ padding: "5px 16px 12px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", margin: 0, fontFamily: "monospace" }}>
              kidstore.pe · {hora} · {sentDate.toLocaleDateString("es-PE")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button onClick={handleCopyAsImage} disabled={copying}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", background: copied ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.07)", border: `1px solid ${copied ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.12)"}`, color: copied ? "#4ade80" : "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 600, cursor: copying ? "wait" : "pointer", fontFamily: ff, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "all 0.2s", opacity: copying ? 0.5 : 1 }}>
            {copied ? <><Check size={14} />Copiado</> : copying ? <>Generando imagen HD...</> : <><Copy size={14} />Copiar como imagen</>}
          </button>
          <button onClick={onClose} style={{ padding: "11px 20px", borderRadius: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)", fontSize: "13px", cursor: "pointer", fontFamily: ff }}>
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GiftSuccessModal;
