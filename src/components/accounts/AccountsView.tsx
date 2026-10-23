import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import api from "../../lib/api";
import AccountsTable from "./AccontsTable";
import AddAccountModal from "./AddAccountModal";
import { Account, mapAccount, rawAccountResponse } from "./types";
import MainContent from "../navigation/MainContent";
import Notice from "../common/Notice";
import usePolling from "../../hooks/usePolling";
import usePageTitle from "../../hooks/usePageTitle";
import { Gamepad2, Plus } from "lucide-react";

const ff = "'Manrope', sans-serif";

interface Props {
  /** API route that lists the accounts to show. */
  endpoint: string;
  /** The admin view lists the accounts of every user. */
  admin?: boolean;
}

/** Linked Fortnite accounts: list, link a new one, unlink. */
const AccountsView: React.FC<Props> = ({ endpoint, admin = false }) => {
  usePageTitle("Cuentas Fortnite");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get(endpoint);
      const data: rawAccountResponse = res.data;
      setAccounts(data?.success && data.gameAccounts?.length ? data.gameAccounts.map(mapAccount) : []);
    } catch (err) {
      console.error("Error fetching Fortnite accounts", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);
  // Shows what the backend has stored (it reads Epic on its own schedule).
  usePolling(fetchAccounts, 60_000);

  const deleteAccount = async (accountId: string) => {
    try {
      await api.post("/disconnectfortniteaccount", { id: accountId });
      setNotice({ type: "ok", text: "Cuenta desvinculada." });
      fetchAccounts();
    } catch (err) {
      console.error("Error deleting account", err);
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error as string | undefined) : undefined;
      setNotice({ type: "error", text: msg || "No se pudo desvincular la cuenta. Inténtalo de nuevo." });
    }
  };

  const plural = accounts.length !== 1;

  return (
    <MainContent>
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { fetchAccounts(); setShowAddModal(false); }}
        />
      )}

      <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", fontFamily: ff }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "24px", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            }}>
              <Gamepad2 size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: "'ReadexPro', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Cuentas Fortnite
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                {admin
                  ? `Administrador · ${accounts.length} cuenta${plural ? "s" : ""}`
                  : `${accounts.length} cuenta${plural ? "s" : ""} conectada${plural ? "s" : ""}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              border: "none", color: "#fff", fontSize: "13px", fontWeight: 600,
              fontFamily: ff, cursor: "pointer", whiteSpace: "nowrap" as const,
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)", transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            <Plus size={15} /> Añadir cuenta
          </button>
        </div>

        {notice && <Notice type={notice.type} text={notice.text} onClose={() => setNotice(null)} />}

        <AccountsTable
          accounts={accounts}
          onDelete={deleteAccount}
          showGiftStatus={true}
          loading={loading}
          onSlotFreed={fetchAccounts}
        />
      </div>
    </MainContent>
  );
};

export default AccountsView;
