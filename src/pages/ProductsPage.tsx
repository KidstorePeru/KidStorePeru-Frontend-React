import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../App";
import ItemCard from "../components/products/ItemCard";
import AccountCard from "../components/products/AccountCard";
import GiftModal from "../components/products/GiftModal";
import GiftSuccessModal from "../components/products/GiftSuccessModal";
import PavosModal from "../components/products/PavosModal";
import { Account, rawAccount, rawAccountResponse } from "../components/accounts";
import { Friend } from "../components/products/GiftModal";
import MainContent from "../components/navigation/MainContent";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import usePageTitle from "../hooks/usePageTitle";

export type RawEntry = any;

export interface ShopEntry {
  regularPrice: number; finalPrice: number; offerId?: string;
  itemDisplay: {
    name: string; type: string; image: string; vBucks: number;
    rarity: string; category: string;
    color?: string; color2?: string; color3?: string;
    backgroundColor?: string; backgroundColor2?: string;
  };
}

const AUTO_REFRESH_INTERVAL = 60 * 1000; // 60 segundos

const ProductsPage: React.FC = () => {
  usePageTitle("Regalos");

  const [itemsByCategory, setItemsByCategory] = useState<Record<string, ShopEntry[]>>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsKey, setAccountsKey] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedAccountPavos, setSelectedAccountPavos] = useState<Account | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPavosModal, setShowPavosModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [lastGiftResponse, setLastGiftResponse] = useState<any>(null);
  const [countdown, setCountdown] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const token = Cookies.get("session");

  useEffect(() => { fetchShop(); fetchAccounts(); }, []);

  // Cuenta regresiva UTC tienda
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(); next.setUTCHours(24, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, []);

  // Auto-refresh de cuentas cada 60 segundos
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      fetchAccounts();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, []);

  const fetchShop = async () => {
    try {
      const res = await fetch("https://fortnite-api.com/v2/shop?language=es-419");
      const json = await res.json();
      const entries = json.data?.entries || [];
      const map: Record<string, ShopEntry[]> = {};
      entries.forEach((entry: any) => {
        if (entry.giftable === false) return;
        const category = entry.layout?.name || "Otros";
        const item = entry.brItems?.[0] || entry.cars?.[0] || entry.instruments?.[0] || entry.tracks?.[0] || entry.legoKits?.[0];
        if (!item) return;
        const name = entry.bundle?.name || (item as any).name || (item as any).title || entry.devName || "Sin nombre";
        const image = entry.newDisplayAsset?.renderImages?.[0]?.image || entry.bundle?.image || (item as any).images?.icon || (item as any).images?.small || (item as any).albumArt || "";
        const rarity = (item as any).rarity?.displayValue || (item as any).rarity?.value || "Común";
        const type = entry.bundle?.info || (item as any).type?.displayValue || entry.layout?.name || "Desconocido";
        const color = entry.colors?.color1 ? `#${entry.colors.color1}` : "";
        const color2 = entry.colors?.color2 ? `#${entry.colors.color2}` : "";
        const color3 = entry.colors?.color3 ? `#${entry.colors.color3}` : "";
        const backgroundColor = entry.colors?.textBackgroundColor ? `#${entry.colors.textBackgroundColor}` : "";
        const backgroundColor2 = entry.colors?.color2 ? `#${entry.colors.color2}` : "";
        const displayItem: ShopEntry = {
          regularPrice: entry.regularPrice ?? 0, finalPrice: entry.finalPrice ?? 0,
          offerId: entry.offerId ?? "unknown-offer",
          itemDisplay: { name, type, image, vBucks: entry.finalPrice ?? 0, rarity, category, color, color2, color3, backgroundColor, backgroundColor2 },
        };
        if (!map[category]) map[category] = [];
        map[category].push(displayItem);
      });
      setItemsByCategory(map); setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/fortniteaccountsofuser`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: rawAccountResponse = res.data;
      if (data.success && data.gameAccounts.length !== 0) {
        const parsed: Account[] = res.data.gameAccounts.map((acc: rawAccount) => ({
          id: acc.id, displayName: acc.displayName,
          pavos: acc.pavos ?? 0, remainingGifts: acc.remainingGifts ?? 0,
          giftSlotStatus: acc.giftSlotStatus,
        })).sort((a: Account, b: Account) => {
          // Cuentas con slots disponibles primero, ordenadas de mayor a menor slots
          const aReady = (a.remainingGifts ?? 0) > 0 ? 1 : 0;
          const bReady = (b.remainingGifts ?? 0) > 0 ? 1 : 0;
          if (aReady !== bReady) return bReady - aReady;
          return (b.remainingGifts ?? 0) - (a.remainingGifts ?? 0);
        });
        setAccounts(parsed);
        setAccountsKey(k => k + 1);
        setLastRefreshed(new Date());
        setSelectedAccount(prev => {
          if (!prev) return prev;
          return parsed.find(a => a.id === prev.id) ?? prev;
        });
        setSelectedAccountPavos(prev => {
          if (!prev) return prev;
          return parsed.find(a => a.id === prev.id) ?? prev;
        });
      } else { setAccounts([]); }
    } catch (err) { console.error(err); }
  }, [token]);

  const sendGift = async (recipient: Friend, creatorCode: string) => {
    if (!selectedItem || !selectedAccount) return;
    try {
      if (selectedAccount.giftSlotStatus && selectedAccount.giftSlotStatus.remaining_gifts <= 0) {
        setLastGiftResponse({ success: false, error: "No hay slots disponibles." });
        setShowErrorModal(true); return;
      }
      const res = await axios.post(`${API_URL}/sendGift`, {
        account_id: selectedAccount.id, sender_username: selectedAccount.displayName,
        receiver_id: recipient.id, receiver_username: recipient.username,
        gift_id: selectedItem.offerId || "", gift_price: selectedItem.finalPrice,
        gift_name: selectedItem.itemDisplay.name,
        message: `¡Disfruta tu regalo de ${selectedAccount.displayName}!`,
        gift_image: selectedItem.itemDisplay.image, creator_code: creatorCode,
      }, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      if (data.success === true) {
        setLastGiftResponse({ ...data, sentAt: new Date().toISOString() }); setShowGiftModal(false); setShowSuccessModal(true); fetchAccounts();
      } else { setLastGiftResponse(data); setShowErrorModal(true); }
    } catch { setShowGiftModal(false); setShowErrorModal(true); }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  // Formatear hora del último refresh
  const lastRefreshedStr = lastRefreshed.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 50, padding: "16px", backdropFilter: "blur(5px)", fontFamily: "'Manrope',sans-serif",
  };
  const modalStyle: React.CSSProperties = {
    background: "var(--bg-modal)", border: "1px solid var(--border)",
    borderRadius: "20px", padding: "28px 24px", width: "100%",
    transition: "background 0.25s, border-color 0.25s",
  };

  return (
    <MainContent>
      {showGiftModal && selectedItem && selectedAccount && (
        <GiftModal onClose={() => { setShowGiftModal(false); fetchAccounts(); }}
          selectedItem={selectedItem} selectedAccount={selectedAccount} onSend={sendGift} />
      )}

      {showPavosModal && selectedAccountPavos && (
        <PavosModal
          account={selectedAccountPavos}
          onClose={() => { setShowPavosModal(false); fetchAccounts(); }}
          onRefresh={fetchAccounts}
          onPavosUpdated={updated => {
            const normalize = (id: string) => id.replace(/-/g, "");
            setAccounts(prev => prev.map(a =>
              normalize(a.id) === normalize(updated.account_id)
                ? { ...a, pavos: updated.new_pavos } : a
            ));
            setAccountsKey(k => k + 1);
            setSelectedAccount(prev =>
              prev && normalize(prev.id) === normalize(updated.account_id)
                ? { ...prev, pavos: updated.new_pavos } : prev
            );
            setSelectedAccountPavos(prev =>
              prev && normalize(prev.id) === normalize(updated.account_id)
                ? { ...prev, pavos: updated.new_pavos } : prev
            );
          }}
        />
      )}

      {showErrorModal && (
        <div style={overlayStyle}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ ...modalStyle, maxWidth: "380px" }}>
            <h2 style={{ fontFamily: "'ReadexPro',sans-serif", fontSize: "16px", color: "var(--danger)", marginBottom: "12px" }}>Error al enviar</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
              {lastGiftResponse?.error || "No se pudo enviar el regalo."}
            </p>
            <button onClick={() => setShowErrorModal(false)}
              style={{ padding: "9px 20px", borderRadius: "9px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
              Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {showSuccessModal && lastGiftResponse?.giftInfo && (
        <GiftSuccessModal
          giftInfo={lastGiftResponse.giftInfo}
          sentAt={lastGiftResponse.sentAt}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      <div style={{ fontFamily: "'Manrope',sans-serif" }}>
        <section style={{ marginBottom: "32px" }}>
          {/* Header cuentas con indicador de auto-refresh */}
          <h1 style={{ fontFamily: "'ReadexPro',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", marginBottom: "4px" }}>
            🛍️ Selecciona una cuenta
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
              {accounts.length} cuentas disponibles
            </p>
            <span style={{ color: "var(--border)" }}>·</span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {/* Punto verde pulsante indicando auto-refresh activo */}
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", animation: "pulse 2s infinite" }}/>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Actualizado a las {lastRefreshedStr}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
            {accounts.length > 0 ? (
              accounts.map(account => (
                <AccountCard
                  key={`${account.id}-${accountsKey}`}
                  account={account}
                  onClick={() => setSelectedAccount(account)}
                  selected={selectedAccount?.id === account.id}
                  onRefresh={fetchAccounts}
                  showGiftStatus={true}
                  handleAddPavos={() => {
                    setSelectedAccountPavos(account);
                    setShowPavosModal(true);
                  }}
                />
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center", gridColumn: "1/-1", fontSize: "13px" }}>
                No tienes cuentas de Fortnite
              </p>
            )}
          </div>
        </section>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: "28px" }} />

        <section style={{ marginBottom: "24px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'ReadexPro',sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
            🎁 Tienda de objetos de Fortnite
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 8px" }}>{dateCapitalized}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "4px 12px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--success)", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Nuevos artículos en{" "}
              <span style={{ color: "var(--accent)", fontWeight: 700, fontFamily: "monospace" }}>{countdown}</span>
              {" "}UTC
            </span>
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </section>

        <div style={{ position: "relative", maxWidth: "380px", margin: "0 auto 28px" }}>
          <Search size={15} color="var(--text-muted)"
            style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Buscar objeto..."
            onChange={e => setSearchTerm(e.target.value.toLowerCase())}
            style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: "10px", background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "'Manrope',sans-serif", outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")} />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>Cargando tienda...</p>
        ) : (
          Object.entries(itemsByCategory).map(([category, items]) => {
            const filtered = items.filter(i => i.itemDisplay.name.toLowerCase().includes(searchTerm));
            if (!filtered.length) return null;
            return (
              <div key={category} style={{ marginBottom: "36px" }}>
                <h3 style={{ fontFamily: "'ReadexPro',sans-serif", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
                  {category}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px" }}>
                  {filtered.map((item, idx) => (
                    <ItemCard key={idx} item={item} onClick={item => {
                      if (!selectedAccount) return;
                      setSelectedItem(item); setShowGiftModal(true);
                    }} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </MainContent>
  );
};

export default ProductsPage;
