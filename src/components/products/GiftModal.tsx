import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShopEntry } from "../../pages/ProductsPage";
import { Account } from "../accounts";
import axios from "axios";
import { API_URL } from "../../App";
import Cookies from "js-cookie";
import GiftSlotStatusInline from "./GiftSlotStatusInline";
import { Search, X, Send, Copy, Check } from "lucide-react";

export interface Friend { id:string; username:string; isGiftable:boolean; }

interface GiftModalProps {
  onClose:()=>void; selectedItem:ShopEntry|null;
  selectedAccount:Account|null; onSend:(recipient:Friend,creatorCode:string)=>void;
}

const GiftModal: React.FC<GiftModalProps> = ({ onClose, selectedItem, selectedAccount, onSend }) => {
  const [searchName, setSearchName] = useState("");
  const [searchResult, setSearchResult] = useState<Friend|null>(null);
  const [searchStatus, setSearchStatus] = useState<"none"|"loading"|"error"|"success">("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const token = Cookies.get("session");

  if (!selectedItem || !selectedAccount) {
    return (
      <div style={ov}>
        <div style={modal}>
          <p style={{ color:"var(--text-secondary)", marginBottom:"16px", fontSize:"13px", textAlign:"center" }}>
            Selecciona un ítem y cuenta.
          </p>
          <button onClick={onClose} style={cancelBtn}>Cerrar</button>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    setSearchStatus("loading"); setErrorMessage("");
    try {
      const res = await axios.post(`${API_URL}/searchfortnitefriend`,
        { display_name:searchName, account_id:selectedAccount.id },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      const data = res.data;
      if (data.error) {
        if (data.error==="Could not refresh access token") { onClose(); window.location.href="/fortniteaccounts"; return; }
        setSearchStatus("error"); setSearchResult(null); setErrorMessage(data.error); return;
      }
      const friend: Friend = { id:data.accountId, username:data.displayName, isGiftable:data.giftable };
      setSearchResult(friend);
      if (data.giftable) { setSearchStatus("success"); }
      else { setSearchStatus("error"); setErrorMessage(data.error||"No puede recibir regalos."); }
    } catch(e:any) {
      setSearchStatus("error"); setSearchResult(null);
      setErrorMessage(e?.response?.data?.error||"Error al buscar.");
    }
  };

  const handleSend = () => {
    if (!searchResult||noSlots) return;
    onSend(searchResult,"KIDDX"); onClose();
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(selectedItem.itemDisplay.image);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]:blob })]);
    } catch { await navigator.clipboard.writeText(selectedItem.itemDisplay.image); }
    setCopied(true); setTimeout(()=>setCopied(false),2200);
  };

  const noSlots = selectedAccount.giftSlotStatus && selectedAccount.giftSlotStatus.remaining_gifts<=0;

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose} style={ov}>
      <motion.div initial={{ opacity:0,scale:0.95,y:14 }} animate={{ opacity:1,scale:1,y:0 }}
        exit={{ opacity:0,scale:0.95 }} transition={{ duration:0.2,ease:"easeOut" }}
        onClick={e=>e.stopPropagation()} style={modal}>

        <button onClick={onClose} style={closeAbs}><X size={13} color="var(--text-muted)"/></button>
        <h2 style={title}>Enviar Regalo</h2>

        {/* Item preview */}
        <div style={{ display:"flex",gap:"14px",alignItems:"center",background:"var(--bg-card)",
          border:"1px solid var(--border)",borderRadius:"12px",padding:"12px 14px",marginBottom:"12px" }}>
          <div style={{ position:"relative",flexShrink:0 }}>
            <img src={selectedItem.itemDisplay.image} alt={selectedItem.itemDisplay.name}
              style={{ width:"62px",height:"62px",objectFit:"contain",borderRadius:"10px",
                background:"var(--bg-card)" }}/>
            <button onClick={handleCopyImage} title="Copiar imagen para cliente"
              style={{ position:"absolute",bottom:"-5px",right:"-5px",width:"22px",height:"22px",
                borderRadius:"50%",background:copied?"var(--success)":"var(--accent)",
                border:"2px solid var(--bg-modal)",display:"flex",alignItems:"center",
                justifyContent:"center",cursor:"pointer",transition:"background 0.2s" }}>
              {copied?<Check size={11} color="#fff"/>:<Copy size={11} color="#fff"/>}
            </button>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontSize:"13px",fontWeight:700,color:"var(--text-primary)",margin:"0 0 5px",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
              {selectedItem.itemDisplay.name}
            </p>
            <div style={{ display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px" }}>
              <img src="https://static.wikia.nocookie.net/fortnite/images/e/eb/V-Bucks_-_Icon_-_Fortnite.png"
                alt="vb" style={{ width:"12px",height:"12px" }}/>
              <span style={{ fontSize:"12px",color:"var(--blue-accent)",fontWeight:600 }}>
                {selectedItem.finalPrice} PAVOS
              </span>
            </div>
            <p style={{ fontSize:"11px",color:"var(--text-muted)",margin:0 }}>
              Desde: <span style={{ color:"var(--pink)" }}>{selectedAccount.displayName}</span>
            </p>
          </div>
        </div>

        {copied&&(
          <div style={{ padding:"8px 12px",borderRadius:"8px",marginBottom:"10px",
            background:"var(--success-bg)",border:"1px solid var(--success-border)",
            fontSize:"11px",color:"var(--success)",textAlign:"center" }}>
            ✓ Imagen copiada — envíala al cliente
          </div>
        )}

        {/* Slots */}
        <div style={{ background:"var(--bg-card)",border:"1px solid var(--border)",
          borderRadius:"10px",padding:"12px 14px",marginBottom:"14px" }}>
          <GiftSlotStatusInline giftSlotStatus={selectedAccount.giftSlotStatus}/>
        </div>

        {/* Buscar */}
        <label style={lbl}>Nombre del amigo en Fortnite</label>
        <div style={{ display:"flex",gap:"8px",marginBottom:"10px" }}>
          <div style={{ position:"relative",flex:1 }}>
            <Search size={13} color="var(--text-muted)"
              style={{ position:"absolute",left:"11px",top:"50%",transform:"translateY(-50%)" }}/>
            <input type="text" value={searchName} onChange={e=>setSearchName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="Nombre de usuario..."
              style={{ ...inp,paddingLeft:"32px" }}
              onFocus={e=>(e.target.style.borderColor="var(--accent)")}
              onBlur={e=>(e.target.style.borderColor="var(--border)")}/>
          </div>
          <button onClick={handleSearch} disabled={searchStatus==="loading"||!searchName.trim()}
            style={{ padding:"10px 16px",borderRadius:"9px",background:"var(--accent)",
              border:"none",color:"#fff",fontSize:"13px",fontWeight:600,
              fontFamily:"'Manrope',sans-serif",cursor:"pointer",whiteSpace:"nowrap" as const,
              opacity:searchStatus==="loading"?0.6:1 }}>
            {searchStatus==="loading"?"...":"Buscar"}
          </button>
        </div>

        <AnimatePresence>
          {searchStatus==="success"&&(
            <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }}
              style={{ marginBottom:"12px",padding:"9px 12px",borderRadius:"8px",
                background:"var(--success-bg)",border:"1px solid var(--success-border)",
                display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:"var(--success)" }}>
              <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:"var(--success)",flexShrink:0 }}/>
              Listo: <strong>{searchResult?.username}</strong>
            </motion.div>
          )}
          {searchStatus==="error"&&(
            <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }}
              style={{ marginBottom:"12px",padding:"9px 12px",borderRadius:"8px",
                background:"var(--danger-bg)",border:"1px solid var(--danger-border)",
                display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:"var(--danger)" }}>
              <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:"var(--danger)",flexShrink:0 }}/>
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={handleSend} disabled={searchStatus!=="success"||!!noSlots}
          style={{ width:"100%",padding:"12px",borderRadius:"10px",border:"1px solid",
            marginBottom:"8px",fontSize:"14px",fontWeight:700,
            fontFamily:"'ReadexPro',sans-serif",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            transition:"all 0.15s",
            background:searchStatus==="success"&&!noSlots?"var(--accent)":"var(--bg-card)",
            borderColor:searchStatus==="success"&&!noSlots?"var(--accent)":"var(--border)",
            color:searchStatus==="success"&&!noSlots?"#fff":"var(--text-muted)",
            cursor:searchStatus==="success"&&!noSlots?"pointer":"not-allowed" }}>
          <Send size={14}/>{noSlots?"Esperando cooldown...":"Enviar Regalo"}
        </button>
        <button onClick={onClose} style={cancelBtn}>Cancelar</button>
      </motion.div>
    </motion.div>
  );
};

const ff="'Manrope',sans-serif";
const ov:React.CSSProperties={ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"16px",backdropFilter:"blur(6px)",fontFamily:ff };
const modal:React.CSSProperties={ background:"var(--bg-modal)",border:"1px solid var(--border)",borderRadius:"20px",padding:"24px",maxWidth:"420px",width:"100%",position:"relative",fontFamily:ff,transition:"background 0.25s,border-color 0.25s" };
const closeAbs:React.CSSProperties={ position:"absolute",top:"16px",right:"16px",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"8px",padding:"5px",cursor:"pointer",display:"flex",alignItems:"center" };
const title:React.CSSProperties={ fontFamily:"'ReadexPro',sans-serif",fontSize:"17px",fontWeight:700,color:"var(--text-primary)",margin:"0 0 16px" };
const lbl:React.CSSProperties={ display:"block",fontSize:"11px",fontWeight:600,color:"var(--text-label)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"8px" };
const inp:React.CSSProperties={ width:"100%",padding:"10px 12px",borderRadius:"9px",background:"var(--bg-input)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:"13px",fontFamily:ff,outline:"none",transition:"border-color 0.15s" };
const cancelBtn:React.CSSProperties={ width:"100%",padding:"10px",borderRadius:"10px",background:"transparent",border:"1px solid var(--border)",color:"var(--text-muted)",fontSize:"13px",cursor:"pointer",fontFamily:ff };

export default GiftModal;
