import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import UsersTable from "../components/users/UsersTable";
import AddUserModal from "../components/users/AddUserModal";
import { User } from "../components/users/type";
import { API_URL } from "../App";
import UpdateUserModal from "../components/users/UpdateUserModal";
import MainContent from "../components/navigation/MainContent";
import { UserPlus, Users } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";

const ff = "'Manrope', sans-serif";

const UsersPage = () => {
  usePageTitle("Usuarios");

  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const token = Cookies.get("session");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/getalluser`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users: User[] = res.data.map((user: any) => ({
        id: user.ID, username: user.Username,
        email: user.Email ?? "", createdAt: user.CreatedAt,
      }));
      setUsers(users);
    } catch (err) { console.error("Error fetching users", err); }
  };

  const addUser = async (user: Partial<User>) => {
    try {
      const res = await axios.post(`${API_URL}/addnewuser`, user,
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.status !== 200) throw new Error("Failed to add user");
      fetchUsers();
    } catch (err) { console.error("Error adding user", err); }
  };

  const updateUser = async (user: User) => {
    setSelectedUser(user); setShowUpdateModal(true);
  };

  const submitUpdateUser = async (user: Partial<User>) => {
    try {
      const res = await axios.post(`${API_URL}/updateuser`, user,
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.status !== 200) throw new Error("Failed to update user");
      fetchUsers();
    } catch (err) { console.error("Error updating user", err); }
  };

  const deleteUser = async (userId: string) => {
    try {
      const res = await axios.post(`${API_URL}/removeusers`, [userId],
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.status !== 200) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err) { console.error("Error deleting user", err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <MainContent>
      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onSave={addUser} />
      )}
      {showUpdateModal && (
        <UpdateUserModal
          user={selectedUser!}
          onClose={() => { setShowUpdateModal(false); setSelectedUser(null); }}
          onUpdate={submitUpdateUser}
        />
      )}

      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", fontFamily: ff }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "16px",
          // Sin flexWrap para que nunca se rompa en dos líneas
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent) 0%, #6d28d9 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
            }}>
              <Users size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'ReadexPro', sans-serif",
                fontSize: "20px", fontWeight: 700,
                color: "var(--text-primary)", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                Usuarios
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Administrador · {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Botón con flexShrink:0 para que nunca se recorte */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              flexShrink: 0,
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", borderRadius: "10px",
              background: "var(--accent)", border: "none",
              color: "#fff", fontSize: "13px", fontWeight: 600,
              fontFamily: ff, cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            <UserPlus size={15} />
            Añadir usuario
          </button>
        </div>

        <UsersTable users={users} onDelete={deleteUser} onUpdate={updateUser} />
      </div>
    </MainContent>
  );
};

export default UsersPage;
