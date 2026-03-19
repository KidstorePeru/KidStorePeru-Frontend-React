import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { API_URL } from "../App";
import AccountsTable from "../components/accounts/AccontsTable";
import AddAccountModal from "../components/accounts/AddAccountModal";
import { Account, rawAccount, rawAccountResponse } from "../components/accounts";
import MainContent from "../components/navigation/MainContent";
import { Gamepad2, Plus } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";

const ff = "'Manrope', sans-serif";

const FortniteAdminAccountsPage = () => {
  usePageTitle("Cuentas Fortnite");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const token = Cookies.get("session");

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/allfortniteaccounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: rawAccountResponse = res.data;
      if (data.success && data.gameAccounts.length !== 0) {
        const parsed: Account[] = res.data.gameAccounts.map((acc: rawAccount) => ({
          id: acc.id, displayName: acc.displayName,
          pavos: acc.pavos ?? 0, remainingGifts: acc.remainingGifts ?? 0,
          giftSlotStatus: acc.giftSlotStatus,
        }));
        setAccounts(parsed);
      } else {
        setAccounts([]);
      }
    } catch (err) { console.error("Error fetching Fortnite accounts", err); }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const res = await axios.post(`${API_URL}/disconnectfortniteaccount`,
        { id: accountId }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 200) fetchAccounts();
    } catch (err) { console.error("Error deleting account", err); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  return (
    <MainContent>
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { fetchAccounts(); setShowAddModal(false); }}
        />
      )}

      <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", fontFamily: ff }}>
        {/* Header */}
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
              <h1 style={{
                fontFamily: "'ReadexPro', sans-serif", fontSize: "20px",
                fontWeight: 700, color: "var(--text-primary)", margin: 0,
              }}>
                Cuentas Fortnite
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Administrador · {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}
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
              fontFamily: ff, cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            <Plus size={15} />
            Añadir cuenta
          </button>
        </div>

        <AccountsTable accounts={accounts} onDelete={deleteAccount} showGiftStatus={true} />
      </div>
    </MainContent>
  );
};

export default FortniteAdminAccountsPage;
