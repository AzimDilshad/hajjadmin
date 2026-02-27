import { useState, createContext, useContext, ReactNode } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SuperAdmin" | "Manager" | "Accountant" | "DataEntry";
  branch?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: "1", name: "Admin User", email: "admin@goodhope.com", password: "admin123", role: "SuperAdmin" },
  { id: "2", name: "Manager", email: "manager@goodhope.com", password: "manager123", role: "Manager" },
  { id: "3", name: "Accountant", email: "accounts@goodhope.com", password: "acc123", role: "Accountant" },
  { id: "4", name: "Data Entry", email: "data@goodhope.com", password: "data123", role: "DataEntry" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SuperAdmin: ["pilgrims.add", "pilgrims.edit", "pilgrims.delete", "pilgrims.view", "accounts.view", "accounts.add", "accounts.edit", "accounts.delete", "packages.manage", "reports.download", "users.manage"],
  Manager: ["pilgrims.add", "pilgrims.edit", "pilgrims.view", "accounts.view", "packages.manage", "reports.download"],
  Accountant: ["pilgrims.view", "accounts.view", "accounts.add", "accounts.edit", "reports.download"],
  DataEntry: ["pilgrims.add", "pilgrims.view"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      sessionStorage.setItem("auth_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("auth_user");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
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
