import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/navigation/Sidebar";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import FortniteAccountsPage from "./pages/GameAccountsPage";
import FortniteAdminAccountsPage from "./pages/AdminGameAccountsPage";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/navigation/ProtectedRoute";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import React from "react";
import { SidebarProvider } from "./components/navigation/SidebarContext";
import { ThemeProvider } from "./components/theme/ThemeContext";
import ThemeToggle from "./components/theme/ThemeToggle";

export const API_URL = import.meta.env.VITE_API_URL;

interface SessionPayload {
  admin?: boolean;
  exp: number;
  user_id: string;
  username: string;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    const session = Cookies.get("session");
    if (!session) { setIsAuthenticated(false); setIsAdmin(false); setIsLoading(false); return; }
    try {
      const response = await axios.get(`${API_URL}/protected`, {
        headers: { Authorization: `Bearer ${session}` },
      });
      if (response.status === 200) {
        const decoded = jwtDecode<SessionPayload>(session);
        setIsAuthenticated(true);
        setIsAdmin(decoded.admin === true);
      } else {
        Cookies.remove("session"); setIsAuthenticated(false); setIsAdmin(false);
      }
    } catch {
      Cookies.remove("session"); setIsAuthenticated(false); setIsAdmin(false);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { checkSession(); }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg-base)" }}>
          <div style={{ width:"36px", height:"36px", border:"3px solid var(--accent-border)", borderTop:"3px solid var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-base)", color:"var(--text-primary)", fontFamily:"'Manrope',sans-serif", position:"relative" }}>
          <ThemeToggle />
          {isAuthenticated && <Sidebar admin={isAdmin} />}
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DashboardPage /></ProtectedRoute>} />
            <Route path="/gifts" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProductsPage /></ProtectedRoute>} />
            {isAdmin && (<>
              <Route path="/usersadminaccounts" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UsersPage /></ProtectedRoute>} />
              <Route path="/fortniteadminaccounts" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FortniteAdminAccountsPage /></ProtectedRoute>} />
              <Route path="/transactionsadminhistory" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminOrdersPage /></ProtectedRoute>} />
            </>)}
            <Route path="/fortniteaccounts" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FortniteAccountsPage /></ProtectedRoute>} />
            <Route path="/transactionshistory" element={<ProtectedRoute isAuthenticated={isAuthenticated}><OrdersPage /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute isAuthenticated={isAuthenticated}><LogoutPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
