import { createContext, useContext, useMemo, useState } from "react";
import { useLoginMutation } from "../redux/slices/authSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [login] = useLoginMutation();

  const handleLogin = async (email, password) => {
    const response = await login({ email, password }).unwrap();
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login: handleLogin, logout }), [user, login]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
