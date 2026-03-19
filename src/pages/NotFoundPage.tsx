import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

const ff = "'Manrope', sans-serif";

const NotFoundPage: React.FC = () => (
  <div style={{
    width:"100vw", height:"100vh",
    display:"flex", alignItems:"center", justifyContent:"center",
    background:"var(--bg-base)", fontFamily:ff,
  }}>
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, ease:"easeOut" }}
      style={{ textAlign:"center", maxWidth:"400px", padding:"32px" }}
    >
      <div style={{
        width:"72px", height:"72px", borderRadius:"20px", margin:"0 auto 24px",
        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <AlertTriangle size={32} color="#ef4444" />
      </div>
      <p style={{
        fontSize:"72px", fontWeight:700, margin:"0 0 8px",
        fontFamily:"'ReadexPro',sans-serif", color:"var(--text-primary)",
        lineHeight:1, letterSpacing:"-2px",
      }}>404</p>
      <h1 style={{
        fontSize:"18px", fontWeight:700, color:"var(--text-primary)",
        margin:"0 0 10px", fontFamily:"'ReadexPro',sans-serif",
      }}>Página no encontrada</h1>
      <p style={{ fontSize:"13px", color:"var(--text-muted)", margin:"0 0 28px", lineHeight:1.6 }}>
        La página que buscas no existe o fue movida.
      </p>
      <Link to="/dashboard" style={{ textDecoration:"none" }}>
        <button style={{
          display:"inline-flex", alignItems:"center", gap:"8px",
          padding:"11px 24px", borderRadius:"10px",
          background:"var(--accent)", border:"none",
          color:"#fff", fontSize:"14px", fontWeight:600,
          fontFamily:"'ReadexPro',sans-serif", cursor:"pointer",
          boxShadow:"0 4px 14px rgba(139,92,246,0.35)",
          transition:"opacity 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
        >
          <Home size={15} /> Volver al Dashboard
        </button>
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
