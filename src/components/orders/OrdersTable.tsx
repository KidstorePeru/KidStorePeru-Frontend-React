import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Transaction } from "./types";

interface Props {
  transactions: Transaction[];
  loading?: boolean;
}

const ff = "'Manrope', sans-serif";
const PAGE_SIZE = 20;

const OrdersTable: React.FC<Props> = ({ transactions, loading = false }) => {
  const [search, setSearch] = useState("");
  const [filterSender, setFilterSender] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Listas únicas para filtros
  const senders = useMemo(() =>
    [...new Set(transactions.map(t => t.senderName).filter(Boolean))].sort() as string[],
    [transactions]
  );

  // Filtrado
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return transactions.filter(tx => {
      const matchSearch = !term ||
        tx.objectStoreName?.toLowerCase().includes(term) ||
        tx.receiverName?.toLowerCase().includes(term) ||
        tx.senderName?.toLowerCase().includes(term);
      const matchSender = !filterSender || tx.senderName === filterSender;
      return matchSearch && matchSender;
    });
  }, [transactions, search, filterSender]);

  // Paginación
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const isManual = (tx: Transaction) => tx.objectStoreID === "manual-adjustment";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getPriceColor = (price: number) =>
    price >= 2000 ? "#f59e0b" : price >= 1000 ? "#a78bfa" : price >= 500 ? "#60a5fa" : "#34d399";

  const activeFilters = (filterSender ? 1 : 0);

  return (
    <div style={{
      background: "var(--bg-modal)", border: "1px solid var(--border)",
      borderRadius: "16px", overflow: "hidden", fontFamily: ff,
      transition: "background 0.25s, border-color 0.25s",
    }}>

      {/* Barra de búsqueda y filtros */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" as const,
      }}>
        {/* Búsqueda */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={13} color="var(--text-muted)"
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text" placeholder="Buscar por regalo, receptor o cuenta..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            style={{
              width: "100%", padding: "8px 12px 8px 32px", borderRadius: "9px",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "12px", fontFamily: ff,
              outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Filtro por cuenta origen */}
        <select
          value={filterSender}
          onChange={e => { setFilterSender(e.target.value); resetPage(); }}
          style={{
            padding: "8px 12px", borderRadius: "9px",
            background: "var(--bg-input)", border: `1px solid ${filterSender ? "var(--accent)" : "var(--border)"}`,
            color: filterSender ? "var(--accent)" : "var(--text-muted)",
            fontSize: "12px", fontFamily: ff, cursor: "pointer", outline: "none",
            minWidth: "160px",
          }}
        >
          <option value="">Todas las cuentas</option>
          {senders.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Limpiar filtros */}
        {(search || filterSender) && (
          <button
            onClick={() => { setSearch(""); setFilterSender(""); resetPage(); }}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "8px 12px", borderRadius: "9px",
              background: "var(--danger-bg)", border: "1px solid var(--danger-border)",
              color: "var(--danger)", fontSize: "11px", fontWeight: 600,
              cursor: "pointer", fontFamily: ff, whiteSpace: "nowrap" as const,
            }}
          >
            <X size={11} /> Limpiar
          </button>
        )}

        {/* Conteo */}
        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" as const, marginLeft: "auto" }}>
          {loading ? "Cargando..." : `${filtered.length} de ${transactions.length}`}
        </span>
      </div>

      {/* Cabecera tabla */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr 150px 150px 100px 140px",
        padding: "10px 20px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
      }}>
        {["", "Regalo", "Cuenta origen", "Receptor", "Precio", "Fecha"].map(h => (
          <span key={h} style={{
            fontSize: "10px", fontWeight: 700, color: "var(--text-muted)",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{h}</span>
        ))}
      </div>

      {/* Filas */}
      {loading ? (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Cargando transacciones...</p>
        </div>
      ) : paginated.length === 0 ? (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <Search size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>No se encontraron transacciones</p>
        </div>
      ) : (
        paginated.map((tx, i) => {
          const { date, time } = formatDate(tx.createdAt);
          const priceColor = getPriceColor(tx.finalPrice);
          const manual = isManual(tx);
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12, delay: i * 0.01 }}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr 150px 150px 100px 140px",
                padding: "10px 20px", alignItems: "center",
                borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
                opacity: manual ? 0.5 : 1,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              {/* Imagen */}
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", overflow: "hidden", background: "var(--bg-card)", flexShrink: 0 }}>
                {tx.giftImage && !manual ? (
                  <img src={tx.giftImage} alt={tx.objectStoreName}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    {manual ? "⚙️" : "🎁"}
                  </div>
                )}
              </div>

              {/* Nombre del regalo */}
              <div style={{ minWidth: 0, paddingRight: "12px" }}>
                <p style={{
                  fontSize: "12px", fontWeight: 600, color: "var(--text-primary)",
                  margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {manual ? "Ajuste manual" : tx.objectStoreName}
                </p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>
                  {tx.id.slice(0, 8)}…
                </p>
              </div>

              {/* Cuenta origen */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700, color: "#fff",
                }}>
                  {tx.senderName?.charAt(0).toUpperCase() || "?"}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {tx.senderName || "—"}
                </span>
              </div>

              {/* Receptor */}
              <div>
                <span style={{
                  fontSize: "12px", color: "#c084fc", fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                }}>
                  {tx.receiverName || "—"}
                </span>
              </div>

              {/* Precio */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <img src="https://fortnite-api.com/images/vbuck.png" style={{ width: "12px", height: "12px" }} alt="vb" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: priceColor }}>
                  {tx.finalPrice.toLocaleString()}
                </span>
              </div>

              {/* Fecha */}
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>{date}</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>{time}</p>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-card)",
        }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Página {page} de {totalPages} · {filtered.length} resultados
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: "30px", height: "30px", borderRadius: "8px", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-modal)", border: "1px solid var(--border)",
                cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={14} color="var(--text-muted)" />
            </button>

            {/* Números de página */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: page === p ? "var(--accent)" : "var(--bg-modal)",
                    border: `1px solid ${page === p ? "var(--accent)" : "var(--border)"}`,
                    color: page === p ? "#fff" : "var(--text-secondary)",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: ff,
                  }}
                >{p}</button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: "30px", height: "30px", borderRadius: "8px", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-modal)", border: "1px solid var(--border)",
                cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
