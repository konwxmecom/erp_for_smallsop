import { createContext, useContext, useState } from "react";
import { authApi } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await authApi.post("/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(shopName, name, email, password) {
    await authApi.post("/register", { shopName, name, email, password });
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await authApi.post("/logout", { refreshToken });
    } catch (e) {
      // ignore -- clear local state anyway
    }
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
