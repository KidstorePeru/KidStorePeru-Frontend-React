import { Menu, LogOut, Gamepad2, History, UserCheck, Gift, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
// @ts-ignore
import imagotipo from "../../../assets/imagotipoo-kidstore.png";
import { useSidebar } from "./SidebarContext";
import React from "react";

const ITEMS_ADMIN = [
  { name:"Dashboard", icon:LayoutDashboard, color:"#8B5CF6", href:"/dashboard" },
  { name:"Regalos", icon:Gift, color:"#8B5CF6", href:"/gifts" },
  { name:"Usuarios (Admin)", icon:UserCheck, color:"#FB923C", href:"/usersadminaccounts" },
  { name:"Cuentas Fortnite (Admin)", icon:Gamepad2, color:"#EC4899", href:"/fortniteadminaccounts" },
  { name:"Cuentas Fortnite", icon:Gamepad2, color:"#3B82F6", href:"/fortniteaccounts" },
  { name:"Historial (Admin)", icon:History, color:"#10B981", href:"/transactionsadminhistory" },
  { name:"Historial", icon:History, color:"#F59E0B", href:"/transactionshistory" },
];
const ITEMS_USER = [
  { name:"Dashboard", icon:LayoutDashboard, color:"#8B5CF6", href:"/dashboard" },
  { name:"Regalos", icon:Gift, color:"#8B5CF6", href:"/gifts" },
  { name:"Cuentas Fortnite", icon:Gamepad2, color:"#3B82F6", href:"/fortniteaccounts" },
  { name:"Historial", icon:History, color:"#F59E0B", href:"/transactionshistory" },
];

const Sidebar = ({ admin }: { admin: boolean }) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const location = useLocation();
  const ITEMS = admin ? ITEMS_ADMIN : ITEMS_USER;

  if (window.location.pathname === "/") return null;

  return (
    <div style={{
      position:"fixed", left:0, top:0, height:"100vh", zIndex:50,
      display:"flex", flexDirection:"column",
      background:"var(--bg-sidebar)",
      borderRight:"1px solid var(--border)",
      fontFamily:"'Manrope',sans-serif",
      overflow:"hidden",
      width: isSidebarOpen ? "240px" : "68px",
      transition:"width 0.28s cubic-bezier(0.4,0,0.2,1), background 0.25s ease, border-color 0.25s ease",
    }}>
      {/* Logo + toggle */}
      <div style={{
        padding:"16px 12px", borderBottom:"1px solid var(--border)", display:"flex",
        alignItems:"center", justifyContent: isSidebarOpen ? "space-between" : "center",
        flexDirection: isSidebarOpen ? "row" : "column", gap:"10px", minHeight:"76px"
      }}>
        <div style={{
          overflow:"hidden", flexShrink:0, borderRadius:"8px",
          width: isSidebarOpen ? "140px" : "36px",
          height:"36px",
          transition:"width 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <img src={imagotipo} alt="KidStore" style={{
            width:"140px", height:"36px",
            objectFit:"cover", objectPosition:"left center", display:"block",
          }} />
        </div>
        <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            padding:"7px", borderRadius:"9px", background:"var(--bg-card)",
            border:"1px solid var(--border)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
          <Menu size={16} color="var(--text-secondary)" />
        </motion.button>
      </div>

      {/* Label MENÚ — condicional directo para no ocupar ancho en DOM */}
      {isSidebarOpen && (
        <div style={{
          padding:"14px 18px 4px", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.1em", color:"var(--text-muted)", textTransform:"uppercase",
          whiteSpace:"nowrap",
        }}>
          Menú
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding:"6px 8px", flex:1, display:"flex", flexDirection:"column", gap:"2px" }}>
        {ITEMS.map(item => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href} style={{ textDecoration:"none" }}>
              <motion.div layout whileHover={{ x: isSidebarOpen ? 2 : 0 }}
                transition={{ type:"spring", stiffness:300, damping:22 }}
                style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  padding: isSidebarOpen ? "9px 11px" : "9px",
                  justifyContent: isSidebarOpen ? "flex-start" : "center",
                  borderRadius:"10px", cursor:"pointer",
                  background: isActive ? "var(--accent-bg)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  transition:"background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <item.icon size={17}
                  style={{ color: isActive ? item.color : "var(--text-muted)", flexShrink:0, transition:"color 0.15s" }} />
                {isSidebarOpen && (
                  <span style={{
                    fontSize:"13px", fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--accent-light)" : "var(--text-secondary)",
                    whiteSpace:"nowrap", overflow:"hidden", fontFamily:"'Manrope',sans-serif",
                  }}>
                    {item.name}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding:"8px", borderTop:"1px solid var(--border)" }}>
        <Link to="/logout" style={{ textDecoration:"none" }}>
          <motion.div whileHover={{ scale:1.02 }}
            style={{
              display:"flex", alignItems:"center", gap:"10px",
              padding: isSidebarOpen ? "9px 11px" : "9px",
              justifyContent: isSidebarOpen ? "flex-start" : "center",
              borderRadius:"10px", background:"var(--danger-bg)",
              border:"1px solid var(--danger-border)", cursor:"pointer", transition:"background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--danger-bg)"}>
            <LogOut size={15} style={{ color:"var(--danger)", flexShrink:0 }} />
            {isSidebarOpen && (
              <span style={{
                fontSize:"13px", fontWeight:600, color:"var(--danger)",
                whiteSpace:"nowrap", overflow:"hidden", fontFamily:"'Manrope',sans-serif",
              }}>
                Cerrar Sesión
              </span>
            )}
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;