import { useState, createContext, useContext, ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SuperAdmin" | "Manager" | "Accountant" | "DataEntry";
  branch?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [permissions, setPermissions] = useState<string[]>(() => {
    const saved = sessionStorage.getItem("auth_permissions");
    return saved ? JSON.parse(saved) : [];
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(email, password);
      setUser(result.user);
      setPermissions(result.permissions);
      sessionStorage.setItem("auth_user", JSON.stringify(result.user));
      sessionStorage.setItem("auth_permissions", JSON.stringify(result.permissions));
      sessionStorage.setItem("auth_token", result.token);
      return true;
    } catch {
      sessionStorage.removeItem("auth_token");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_permissions");
    sessionStorage.removeItem("auth_token");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
