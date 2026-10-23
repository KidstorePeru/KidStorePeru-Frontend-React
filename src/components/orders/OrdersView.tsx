import React, { useCallback, useEffect, useState } from "react";
import api from "../../lib/api";
import { mapTransaction, newestFirst, rawTransactionsResponse, salesStats, Transaction } from "./types";
import MainContent from "../navigation/MainContent";
import OrdersTable from "./OrdersTable";
import Notice from "../common/Notice";
import usePolling from "../../hooks/usePolling";
import usePageTitle from "../../hooks/usePageTitle";
import { formatCents } from "../../lib/pricing";
import { History, TrendingUp, Users, Gamepad2, Package } from "lucide-react";

const ff = "'Manrope', sans-serif";

interface Props {
  /** API route that lists the transactions to show. */
  endpoint: string;
  subtitle: string;
  /** The admin view lists every account, so its statistics are labelled differently. */
  admin?: boolean;
}

/** Sales history: statistics (with the soles total) plus the searchable table. */
const OrdersView: React.FC<Props> = ({ endpoint, subtitle, admin = false }) => {
  usePageTitle("Historial");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // `silent` refreshes in the background without the "loading" state.
  const fetchTransactions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(endpoint);
      const data: rawTransactionsResponse = res.data;
      const list = data.success ? data.transactions.map(mapTransaction) : [];
      setTransactions(list.sort(newestFirst));
      setError("");
    } catch (err) {
      console.error("Error fetching transactions", err);
      if (!silent) setError("No se pudo cargar el historial. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  usePolling(() => fetchTransactions(true), 60_000);

  const sales = salesStats(transactions);

  const stats = [
    { icon: <Package size={18} color="#a78bfa" />, label: "Total regalos", value: sales.gifts.toLocaleString(), bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
    { icon: <TrendingUp size={18} color="#60a5fa" />, label: `V-Bucks gastados · ${formatCents(sales.cents)}`, value: sales.pavos.toLocaleString(), bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" },
    admin
      ? { icon: <Users size={18} color="#34d399" />, label: "Receptores únicos", value: sales.receivers.toLocaleString(), bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" }
      : { icon: <Gamepad2 size={18} color="#fbbf24" />, label: "Cuentas usadas", value: sales.senders.toLocaleString(), bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
    admin
      ? { icon: <Gamepad2 size={18} color="#fbbf24" />, label: "Cuentas origen", value: sales.senders.toLocaleString(), bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" }
      : { icon: <History size={18} color="#34d399" />, label: "Clientes atendidos", value: sales.receivers.toLocaleString(), bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
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
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>
          </div>
        </div>

        {error && <Notice type="error" text={error} onClose={() => setError("")} />}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "20px" }}>
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

        <OrdersTable transactions={transactions} loading={loading} />
      </div>
    </MainContent>
  );
};

export default OrdersView;
