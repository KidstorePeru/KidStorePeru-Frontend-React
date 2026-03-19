import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../App";
import MainContent from "../components/navigation/MainContent";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Gift, TrendingUp, Gamepad2,
  Coins, Users, Trophy, Clock, ChevronRight,
  CheckCircle, RefreshCw,
} from "lucide-react";

const ff = "'Manrope', sans-serif";

interface SessionPayload { admin?: boolean; exp: number; user_id: string; username: string; }
interface Account { id:string; displayName:string; pavos:number; remainingGifts:number; }
interface Transaction {
  ID:string; SenderName:string; ReceiverName:string;
  ObjectStoreName:string; FinalPrice:number; GiftImage:string; CreatedAt:string;
}

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data) || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={(data.length-1)/(data.length-1)*w}
        cy={h-(data[data.length-1]/max)*h}
        r="2.5" fill={color} />
    </svg>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string;
  sub?: string; trend?: string; trendUp?: boolean;
  accent: string; spark?: number[];
}> = ({ icon, label, value, sub, trend, trendUp, accent, spark }) => (
  <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
    style={{ background:"var(--bg-modal)", border:"1px solid var(--border)", borderRadius:"16px",
      padding:"18px 20px", display:"flex", flexDirection:"column", gap:"12px",
      transition:"background 0.25s, border-color 0.25s", fontFamily:ff }}>
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
      <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:`${accent}18`,
        border:`1px solid ${accent}30`, display:"flex", alignItems:"center",
        justifyContent:"center", flexShrink:0 }}>
        {icon}
      </div>
      {spark && <Sparkline data={spark} color={accent} />}
    </div>
    <div>
      <p style={{ fontSize:"24px", fontWeight:700, color:"var(--text-primary)", margin:"0 0 2px",
        fontFamily:"'ReadexPro',sans-serif" }}>{value}</p>
      <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>{label}</p>
    </div>
    {(trend || sub) && (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {trend && (
          <span style={{ fontSize:"11px", fontWeight:600,
            color: trendUp === true ? "#10b981" : trendUp === false ? "#ef4444" : "var(--text-muted)" }}>
            {trendUp === true ? "↑" : trendUp === false ? "↓" : ""} {trend}
          </span>
        )}
        {sub && <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>{sub}</span>}
      </div>
    )}
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const token = Cookies.get("session");

  // Detectar si es admin desde el JWT — sin prop drilling
  const isAdmin = (() => {
    try { return jwtDecode<SessionPayload>(token || "").admin === true; }
    catch { return false; }
  })();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([
        // Admin ve todas las cuentas, usuario solo las suyas
        axios.get(`${API_URL}/${isAdmin ? "allfortniteaccounts" : "fortniteaccountsofuser"}`,
          { headers: { Authorization: `Bearer ${token}` } }),
        // Admin ve todas las transacciones, usuario solo las suyas
        axios.get(`${API_URL}/${isAdmin ? "alltransactions" : "transactions"}`,
          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAccounts(accRes.data.gameAccounts || []);
      setTxs(txRes.data.transactions || []);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Cálculos ──
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);

  const todayTxs = txs.filter(t => new Date(t.CreatedAt) >= today);
  const yesterdayTxs = txs.filter(t => { const d = new Date(t.CreatedAt); return d >= yesterday && d < today; });
  const todayVb = todayTxs.reduce((s,t) => s + t.FinalPrice, 0);
  const yesterdayVb = yesterdayTxs.reduce((s,t) => s + t.FinalPrice, 0);

  const readyAccounts = accounts.filter(a => (a.remainingGifts||0) > 0).length;
  const totalPavos = accounts.reduce((s,a) => s + (a.pavos||0), 0);
  const totalSlots = accounts.reduce((s,a) => s + (a.remainingGifts||0), 0);
  const totalVbucksSold = txs.reduce((s,t) => s + t.FinalPrice, 0);

  const last6 = [...txs].sort((a,b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()).slice(0,6);

  const days7 = Array.from({length:7}, (_,i) => {
    const d = new Date(today); d.setDate(d.getDate()-6+i);
    return txs.filter(t => { const td=new Date(t.CreatedAt); td.setHours(0,0,0,0); return td.getTime()===d.getTime(); }).length;
  });
  const vb7 = Array.from({length:7}, (_,i) => {
    const d = new Date(today); d.setDate(d.getDate()-6+i);
    return txs.filter(t => { const td=new Date(t.CreatedAt); td.setHours(0,0,0,0); return td.getTime()===d.getTime(); }).reduce((s,t)=>s+t.FinalPrice,0);
  });

  const receiverMap: Record<string,number> = {};
  txs.forEach(t => { receiverMap[t.ReceiverName] = (receiverMap[t.ReceiverName]||0) + 1; });
  const topReceivers = Object.entries(receiverMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxReceiver = topReceivers[0]?.[1] || 1;

  const itemMap: Record<string,number> = {};
  txs.forEach(t => { itemMap[t.ObjectStoreName] = (itemMap[t.ObjectStoreName]||0) + 1; });
  const topItems = Object.entries(itemMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxItem = topItems[0]?.[1] || 1;

  const maxDay = Math.max(...days7) || 1;

  const formatHour = (iso: string) => new Date(iso).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"});
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const t2 = new Date(); t2.setHours(0,0,0,0);
    if (d >= t2) return `Hoy ${formatHour(iso)}`;
    return d.toLocaleDateString("es-PE",{day:"2-digit",month:"short"}) + " " + formatHour(iso);
  };
  const getPriceColor = (p: number) => p >= 2000 ? "#f59e0b" : p >= 1000 ? "#a78bfa" : p >= 500 ? "#60a5fa" : "#34d399";

  const acctLink = isAdmin ? "/fortniteadminaccounts" : "/fortniteaccounts";
  const txLink = isAdmin ? "/transactionsadminhistory" : "/transactionshistory";

  return (
    <MainContent>
      <div style={{ width:"100%", maxWidth:"1100px", margin:"0 auto", fontFamily:ff }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:"24px", gap:"16px", flexWrap:"wrap" as const }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"42px", height:"42px", borderRadius:"12px", flexShrink:0,
              background:"linear-gradient(135deg, var(--accent) 0%, #6d28d9 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 14px rgba(139,92,246,0.35)" }}>
              <LayoutDashboard size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontFamily:"'ReadexPro',sans-serif", fontSize:"20px", fontWeight:700,
                color:"var(--text-primary)", margin:0 }}>Dashboard</h1>
              <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>
                {loading ? "Actualizando..." : `Actualizado a las ${lastUpdated.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`}
              </p>
            </div>
          </div>
          <button onClick={fetchAll} disabled={loading}
            style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 16px",
              borderRadius:"10px", background:"var(--bg-card)", border:"1px solid var(--border)",
              color:"var(--text-secondary)", fontSize:"12px", fontWeight:600,
              cursor: loading ? "wait" : "pointer", fontFamily:ff, opacity: loading ? 0.5 : 1 }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
            {loading ? "Actualizando..." : "Actualizar"}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:"12px", marginBottom:"16px" }}>
          <StatCard icon={<Gift size={18} color="#a78bfa" />} label="Regalos hoy"
            value={todayTxs.length.toString()}
            trend={`${todayTxs.length > yesterdayTxs.length ? "+" : ""}${todayTxs.length - yesterdayTxs.length} vs ayer`}
            trendUp={todayTxs.length >= yesterdayTxs.length} accent="#a78bfa" spark={days7} />
          <StatCard icon={<TrendingUp size={18} color="#60a5fa" />} label="V-Bucks hoy"
            value={todayVb.toLocaleString()}
            trend={`${todayVb >= yesterdayVb ? "+" : ""}${(todayVb-yesterdayVb).toLocaleString()} vs ayer`}
            trendUp={todayVb >= yesterdayVb} accent="#60a5fa" spark={vb7.map(v => v/1000)} />
          <StatCard icon={<CheckCircle size={18} color="#10b981" />} label="Cuentas listas"
            value={accounts.length ? `${readyAccounts} / ${accounts.length}` : "—"}
            sub={accounts.length ? `${totalSlots} slots disponibles` : undefined}
            trend={accounts.length ? (accounts.length - readyAccounts > 0 ? `${accounts.length - readyAccounts} en cooldown` : "Todas listas") : undefined}
            trendUp={readyAccounts === accounts.length && accounts.length > 0} accent="#10b981" />
          <StatCard icon={<Coins size={18} color="#fbbf24" />} label="V-Bucks en stock"
            value={totalPavos.toLocaleString()}
            sub={txs.length ? `${txs.length.toLocaleString()} regalos totales` : undefined}
            accent="#fbbf24" />
        </div>

        {/* Gráfico + Cuentas */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"12px", marginBottom:"12px" }}>
          <div style={{ background:"var(--bg-modal)", border:"1px solid var(--border)", borderRadius:"16px",
            padding:"18px 20px", transition:"background 0.25s, border-color 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
              <p style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Regalos — últimos 7 días</p>
              <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>Total: {days7.reduce((s,v)=>s+v,0)}</span>
            </div>
            {txs.length === 0 && !loading ? (
              <div style={{ height:"80px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>Sin datos aún</p>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"80px", marginBottom:"8px" }}>
                  {days7.map((count, i) => {
                    const isToday = i === 6;
                    const h = Math.max((count/maxDay)*76, count > 0 ? 6 : 2);
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column",
                        alignItems:"center", gap:"3px", height:"100%", justifyContent:"flex-end" }}>
                        <span style={{ fontSize:"10px", fontWeight:600,
                          color: count > 0 ? "var(--text-secondary)" : "transparent" }}>{count}</span>
                        <div style={{ width:"100%", height:`${h}px`, borderRadius:"4px 4px 0 0",
                          background: isToday ? "#a78bfa" : "rgba(139,92,246,0.3)" }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:"6px" }}>
                  {days7.map((_, i) => {
                    const d = new Date(today); d.setDate(d.getDate()-6+i);
                    const isToday = i === 6;
                    return (
                      <div key={i} style={{ flex:1, textAlign:"center", fontSize:"9px",
                        color: isToday ? "#a78bfa" : "var(--text-muted)",
                        fontWeight: isToday ? 700 : 400 }}>
                        {isToday ? "Hoy" : d.toLocaleDateString("es-PE",{weekday:"short"})}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div style={{ background:"var(--bg-modal)", border:"1px solid var(--border)", borderRadius:"16px",
            padding:"18px 20px", transition:"background 0.25s, border-color 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
              <p style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Estado cuentas</p>
              <Link to={acctLink} style={{ fontSize:"11px", color:"var(--accent)",
                textDecoration:"none", display:"flex", alignItems:"center", gap:"2px" }}>
                Ver todas <ChevronRight size={11} />
              </Link>
            </div>
            {accounts.length === 0 && !loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100px" }}>
                <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>Sin cuentas conectadas</p>
              </div>
            ) : (
              <>
                <div style={{ height:"6px", borderRadius:"3px", background:"var(--border)", overflow:"hidden", marginBottom:"6px" }}>
                  <div style={{ height:"100%", borderRadius:"3px", background:"#10b981",
                    width: accounts.length ? `${(readyAccounts/accounts.length)*100}%` : "0%",
                    transition:"width 0.5s ease" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                  <span style={{ fontSize:"10px", color:"#10b981", fontWeight:600 }}>{readyAccounts} listas</span>
                  <span style={{ fontSize:"10px", color:"var(--text-muted)" }}>{accounts.length - readyAccounts} en cooldown</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
                  {[...accounts].sort((a,b) => (b.remainingGifts||0)-(a.remainingGifts||0)).slice(0,5).map((acc,i) => {
                    const ready = (acc.remainingGifts||0) > 0;
                    return (
                      <div key={acc.id} style={{ display:"flex", alignItems:"center", gap:"8px",
                        padding:"7px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ width:"26px", height:"26px", borderRadius:"7px", flexShrink:0,
                          background: ready ? "rgba(16,185,129,0.12)" : "rgba(251,191,36,0.1)",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {ready ? <CheckCircle size={13} color="#10b981" /> : <Clock size={13} color="#fbbf24" />}
                        </div>
                        <span style={{ flex:1, fontSize:"12px", fontWeight:600, color:"var(--text-primary)",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {acc.displayName}
                        </span>
                        <span style={{ fontSize:"11px", fontWeight:600,
                          color: ready ? "#10b981" : "var(--text-muted)" }}>
                          {acc.remainingGifts}/5
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transacciones + Top Clientes + Top Items */}
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr 1fr", gap:"12px" }}>
          <div style={{ background:"var(--bg-modal)", border:"1px solid var(--border)", borderRadius:"16px",
            padding:"18px 20px", transition:"background 0.25s, border-color 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
              <p style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Últimas transacciones</p>
              <Link to={txLink} style={{ fontSize:"11px", color:"var(--accent)",
                textDecoration:"none", display:"flex", alignItems:"center", gap:"2px" }}>
                Ver todas <ChevronRight size={11} />
              </Link>
            </div>
            {last6.length === 0 && !loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100px" }}>
                <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>Sin transacciones aún</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" }}>
                {last6.map((tx, i) => (
                  <div key={tx.ID} style={{ display:"flex", alignItems:"center", gap:"10px",
                    padding:"8px 0", borderBottom: i < last6.length-1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width:"34px", height:"34px", borderRadius:"8px", overflow:"hidden",
                      background:"var(--bg-card)", flexShrink:0 }}>
                      {tx.GiftImage
                        ? <img src={tx.GiftImage} alt={tx.ObjectStoreName}
                            style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:"14px" }}>🎁</div>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:"12px", fontWeight:600, color:"var(--text-primary)", margin:0,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {tx.ObjectStoreName}
                      </p>
                      <p style={{ fontSize:"10px", color:"var(--text-muted)", margin:0 }}>
                        {tx.SenderName} → <span style={{ color:"#c084fc" }}>{tx.ReceiverName}</span>
                      </p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontSize:"12px", fontWeight:700, color:getPriceColor(tx.FinalPrice), margin:0 }}>
                        {tx.FinalPrice.toLocaleString()}
                      </p>
                      <p style={{ fontSize:"10px", color:"var(--text-muted)", margin:0, fontFamily:"monospace" }}>
                        {formatDate(tx.CreatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background:"var(--bg-modal)", border:"1px solid var(--border)", borderRadius:"16px",
            padding:"18px 20px", transition:"background 0.25s, border-color 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
              <Trophy size={13} color="#fbbf24" />
              <p style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Top clientes</p>
            </div>
            {topReceivers.length === 0 && !loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80px" }}>
                <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>Sin datos aún</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {topReceivers.map(([name, count], i) => (
                  <div key={name}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                        <span style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", width:"14px" }}>#{i+1}</span>
                        <span style={{ fontSize:"11px", fontWeight:600, color:"var(--text-primary)",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100px" }}>
                          {name}
                        </span>
                      </div>
                      <span style={{ fontSize:"11px", fontWeight:700, color:"#fbbf24" }}>{count}</span>
                    </div>
                    <div style={{ height:"4px", borderRadius:"2px", background:"var(--border)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:"2px",
                        background: i===0?"#fbbf24":i===1?"#94a3b8":"#64748b",
                        width:`${(count/maxReceiver)*100}%`, transition:"width 0.5s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background:"var(--bg-modal)", border:"1px solid var(--border)", borderRadius:"16px",
            padding:"18px 20px", transition:"background 0.25s, border-color 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
              <Gift size={13} color="#a78bfa" />
              <p style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                letterSpacing:"0.08em", textTransform:"uppercase", margin:0 }}>Items más regalados</p>
            </div>
            {topItems.length === 0 && !loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80px" }}>
                <p style={{ fontSize:"12px", color:"var(--text-muted)", margin:0 }}>Sin datos aún</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {topItems.map(([name, count], i) => (
                  <div key={name}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                        <span style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", width:"14px" }}>#{i+1}</span>
                        <span style={{ fontSize:"11px", fontWeight:600, color:"var(--text-primary)",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100px" }}>
                          {name}
                        </span>
                      </div>
                      <span style={{ fontSize:"11px", fontWeight:700, color:"#a78bfa" }}>{count}x</span>
                    </div>
                    <div style={{ height:"4px", borderRadius:"2px", background:"var(--border)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:"2px",
                        background: i===0?"#a78bfa":"rgba(139,92,246,0.4)",
                        width:`${(count/maxItem)*100}%`, transition:"width 0.5s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Totales históricos */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:"12px", marginTop:"12px" }}>
          {[
            { icon:<Gift size={16} color="#a78bfa"/>, label:"Total regalos enviados", value: txs.length.toLocaleString(), accent:"#a78bfa" },
            { icon:<TrendingUp size={16} color="#60a5fa"/>, label:"Total V-Bucks facturados", value: totalVbucksSold.toLocaleString(), accent:"#60a5fa" },
            { icon:<Users size={16} color="#34d399"/>, label:"Clientes únicos atendidos", value: Object.keys(receiverMap).length.toLocaleString(), accent:"#34d399" },
          ].map(({ icon, label, value, accent }) => (
            <div key={label} style={{ background:"var(--bg-modal)", border:"1px solid var(--border)",
              borderRadius:"14px", padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px",
              transition:"background 0.25s, border-color 0.25s" }}>
              <div style={{ width:"34px", height:"34px", borderRadius:"9px", flexShrink:0,
                background:`${accent}18`, border:`1px solid ${accent}28`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {icon}
              </div>
              <div>
                <p style={{ fontSize:"18px", fontWeight:700, color:"var(--text-primary)", margin:0,
                  fontFamily:"'ReadexPro',sans-serif" }}>{loading ? "—" : value}</p>
                <p style={{ fontSize:"11px", color:"var(--text-muted)", margin:0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </MainContent>
  );
};

export default DashboardPage;
