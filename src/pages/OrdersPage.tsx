import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../App";
import { rawTransactionsResponse, Transaction } from "../components/orders/types";
import MainContent from "../components/navigation/MainContent";
import { History, TrendingUp, Gamepad2, Package } from "lucide-react";
import OrdersTable from "../components/orders/OrdersTable";
import usePageTitle from "../hooks/usePageTitle";

const ff = "'Manrope', sans-serif";

const OrdersPage: React.FC = () => {
  usePageTitle("Historial");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("session");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 200) throw new Error("Failed");
      const data: rawTransactionsResponse = res.data;
      const list = data.success && data.transactions.map((tx: any) => ({
        id: tx.ID, gameAccountID: tx.GameAccountID,
        senderName: tx.SenderName || null,
        receiverID: tx.ReceiverID, receiverName: tx.ReceiverName,
        objectStoreID: tx.ObjectStoreID, objectStoreName: tx.ObjectStoreName,
        regularPrice: tx.RegularPrice, finalPrice: tx.FinalPrice,
        giftImage: tx.GiftImage, createdAt: tx.CreatedAt,
      }));
      setTransactions((list || []).reverse());
    } catch (err) {
      console.error("Error fetching transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // Stats relevantes para el usuario
  const totalVbucks = transactions.reduce((s, t) => s + (t.finalPrice || 0), 0);
  const uniqueReceivers = new Set(transactions.map(t => t.receiverName)).size;
  const uniqueSenders = new Set(transactions.map(t => t.senderName).filter(Boolean)).size;

  const stats = [
    { icon: <Package size={18} color="#a78bfa" />, label: "Total regalos", value: transactions.length.toLocaleString(), bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
    { icon: <TrendingUp size={18} color="#60a5fa" />, label: "V-Bucks gastados", value: totalVbucks.toLocaleString(), bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" },
    { icon: <Gamepad2 size={18} color="#fbbf24" />, label: "Cuentas usadas", value: uniqueSenders.toLocaleString(), bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
    { icon: <History size={18} color="#34d399" />, label: "Clientes atendidos", value: uniqueReceivers.toLocaleString(), bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
  ];

  return (
    <MainContent>
      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", fontFamily: ff }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
          }}>
            <History size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'ReadexPro', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Historial
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
              Tus transacciones
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {stats.map(({ icon, label, value, bg, border }) => (
            <div key={label} style={{
              background: "var(--bg-modal)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "16px 18px",
              display: "flex", alignItems: "center", gap: "12px",
              transition: "background 0.25s, border-color 0.25s",
            }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "'ReadexPro', sans-serif" }}>
                  {loading ? "—" : value}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla — reutiliza el mismo componente del admin */}
        <OrdersTable transactions={transactions} loading={loading} />
      </div>
    </MainContent>
  );
};

export default OrdersPage;
