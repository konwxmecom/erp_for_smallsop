import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Parties from "./pages/Parties";
import PurchaseEntry from "./pages/PurchaseEntry";
import SaleEntry from "./pages/SaleEntry";
import Reports from "./pages/Reports";

function AppLayout({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase"
              element={
                <ProtectedRoute>
                  <PurchaseEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sale"
              element={
                <ProtectedRoute>
                  <SaleEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties"
              element={
                <ProtectedRoute>
                  <Parties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
