import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="sidebar">
      <h2>🏪 Dukaan ERP</h2>
      <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/purchase" className={({ isActive }) => (isActive ? "active" : "")}>
        📥 Purchase Entry
      </NavLink>
      <NavLink to="/sale" className={({ isActive }) => (isActive ? "active" : "")}>
        📤 Sale Entry
      </NavLink>
      <NavLink to="/parties" className={({ isActive }) => (isActive ? "active" : "")}>
        👥 Parties (Udhaar)
      </NavLink>
      <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
        📦 Products
      </NavLink>
      <NavLink to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
        📈 Reports
      </NavLink>
      <a href="#" onClick={handleLogout} style={{ marginTop: 30, opacity: 0.85 }}>
        🚪 Logout ({user?.name})
      </a>
    </div>
  );
}
