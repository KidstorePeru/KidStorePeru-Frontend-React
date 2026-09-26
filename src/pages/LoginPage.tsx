import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import React from "react";
import api, { getToken, setSessionToken } from "../lib/api";
import axios from "axios";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<string | null>(getToken() ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("user", username); formData.append("password", password);
      const res = await api.post("/loginform", formData, {
        headers: { "Content-Type":"application/x-www-form-urlencoded" },
      });
      if (res.data.token) {
        setSessionToken(res.data.token);
        setSession(res.data.token);
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError(err.response.data?.error || "Demasiados intentos. Espera unos minutos.");
      } else {
        setError("No se pudo conectar. Intenta de nuevo.");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (session) window.location.href = "/dashboard"; }, [session]);

  const inp: React.CSSProperties = {
    width:"100%", padding:"11px 14px 11px 38px", borderRadius:"10px",
    background:"var(--bg-input)", border:"1px solid var(--border)",
    color:"var(--text-primary)", fontSize:"14px",
    fontFamily:"'Manrope',sans-serif", outline:"none", transition:"border-color 0.15s",
  };

  return (
    <div style={{ width:"100vw", height:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"var(--bg-base)", fontFamily:"'Manrope',sans-serif",
      transition:"background 0.25s ease" }}>

      {/* Glow decorativo solo en modo oscuro */}
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)",
        width:"500px", height:"500px",
        background:"radial-gradient(circle, var(--accent-bg) 0%, transparent 70%)",
        pointerEvents:"none" }} />

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.45, ease:"easeOut" }}
        style={{ width:"100%", maxWidth:"400px", padding:"40px 36px", borderRadius:"20px",
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          position:"relative", zIndex:1, boxShadow:"0 4px 40px rgba(0,0,0,0.08)",
          transition:"background 0.25s ease, border-color 0.25s ease" }}>

        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:"52px", height:"52px", borderRadius:"14px",
            background:"var(--accent-bg)", border:"1px solid var(--accent-border)", marginBottom:"16px" }}>
            <Lock size={22} color="var(--accent)" />
          </div>
          <h1 style={{ fontFamily:"'ReadexPro',sans-serif", fontSize:"22px", fontWeight:700,
            color:"var(--text-primary)", margin:"0 0 6px", letterSpacing:"-0.3px" }}>
            Iniciar Sesión
          </h1>
          <p style={{ fontSize:"13px", color:"var(--text-muted)" }}>Bienvenido a KidStore</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label style={{ display:"block", fontSize:"11px", fontWeight:600,
              color:"var(--text-label)", letterSpacing:"0.06em",
              textTransform:"uppercase", marginBottom:"7px" }}>Usuario</label>
            <div style={{ position:"relative" }}>
              <User size={15} color="var(--text-muted)"
                style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)" }} />
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                placeholder="Ingresa tu usuario" autoComplete="username" style={inp}
                onFocus={e=>(e.target.style.borderColor="var(--accent)")}
                onBlur={e=>(e.target.style.borderColor="var(--border)")} />
            </div>
          </div>

          <div>
            <label style={{ display:"block", fontSize:"11px", fontWeight:600,
              color:"var(--text-label)", letterSpacing:"0.06em",
              textTransform:"uppercase", marginBottom:"7px" }}>Contraseña</label>
            <div style={{ position:"relative" }}>
              <Lock size={15} color="var(--text-muted)"
                style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)" }} />
              <input type={showPassword?"text":"password"} value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña" autoComplete="current-password"
                style={{ ...inp, paddingRight:"42px" }}
                onFocus={e=>(e.target.style.borderColor="var(--accent)")}
                onBlur={e=>(e.target.style.borderColor="var(--border)")} />
              <button type="button" onClick={()=>setShowPassword(!showPassword)}
                style={{ position:"absolute", right:"13px", top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", padding:0,
                  display:"flex", alignItems:"center" }}>
                {showPassword ? <EyeOff size={15} color="var(--text-muted)" />
                  : <Eye size={15} color="var(--text-muted)" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
              style={{ padding:"10px 14px", borderRadius:"8px", background:"var(--danger-bg)",
                border:"1px solid var(--danger-border)", color:"var(--danger)",
                fontSize:"13px", textAlign:"center" }}>
              {error}
            </motion.div>
          )}

          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"12px", borderRadius:"10px",
              background: loading ? "var(--accent-border)" : "var(--accent)",
              border:"none", color:"#fff", fontSize:"14px", fontWeight:700,
              fontFamily:"'ReadexPro',sans-serif", cursor: loading ? "not-allowed" : "pointer",
              transition:"all 0.15s" }}
            onMouseEnter={e=>{ if(!loading) (e.currentTarget as HTMLElement).style.opacity="0.9"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.opacity="1"; }}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
export default LoginPage;
