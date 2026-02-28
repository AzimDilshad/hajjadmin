import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { DashboardStats, DocumentRecord, Lead, Package, PassportDetails, Payment, Pilgrim } from "@/types";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "SuperAdmin" | "Manager" | "Accountant" | "DataEntry";
  branch?: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
}

interface DataContextType {
  packages: Package[];
  pilgrims: Pilgrim[];
  passportDetails: PassportDetails[];
  payments: Payment[];
  documents: DocumentRecord[];
  leads: Lead[];
  users: UserRecord[];
  loading: boolean;
  stats: DashboardStats;
  refresh: () => Promise<void>;

  addPilgrim: (payload: Record<string, unknown>) => Promise<void>;
  updatePilgrim: (id: string, payload: Record<string, unknown>) => Promise<void>;
  deletePilgrim: (id: string) => Promise<void>;
  addPayment: (payload: Omit<Payment, "id">) => Promise<void>;

  addLead: (payload: Omit<Lead, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateLead: (id: string, payload: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  addPackage: (payload: Omit<Package, "id">) => Promise<void>;
  updatePackage: (id: string, payload: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;

  addUser: (payload: Partial<UserRecord>) => Promise<void>;
  updateUser: (id: string, payload: Partial<UserRecord>) => Promise<void>;
  setUserPassword: (id: string, password: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;

  addDocument: (payload: Omit<DocumentRecord, "id" | "uploaded_at">) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [passportDetails, setPassportDetails] = useState<PassportDetails[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.bootstrap();
      setPackages(data.packages || []);
      setPilgrims(data.pilgrims || []);
      setPassportDetails(data.passportDetails || []);
      setPayments(data.payments || []);
      setDocuments(data.documents || []);
      setUsers(data.users || []);
      setLeads(data.leads || []);
    } catch {
      setPackages([]);
      setPilgrims([]);
      setPassportDetails([]);
      setPayments([]);
      setDocuments([]);
      setUsers([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => {
    const hajjPkgIds = packages.filter((p) => p.package_name.toLowerCase().includes("hajj")).map((p) => p.id);
    const umrahPkgIds = packages.filter((p) => p.package_name.toLowerCase().includes("umrah")).map((p) => p.id);
    const totalRevenue = pilgrims.reduce((sum, p) => sum + (packages.find((pk) => pk.id === p.package_id)?.base_price || 0), 0);
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPilgrims: pilgrims.length,
      hajjRegistrations: pilgrims.filter((p) => hajjPkgIds.includes(p.package_id)).length,
      umrahRegistrations: pilgrims.filter((p) => umrahPkgIds.includes(p.package_id)).length,
      totalRevenue,
      totalReceived,
      totalPending: totalRevenue - totalReceived,
    };
  }, [packages, pilgrims, payments]);

  return (
    <DataContext.Provider
      value={{
        packages,
        pilgrims,
        passportDetails,
        payments,
        documents,
        users,
        leads,
        loading,
        stats,
        refresh,
        addPilgrim: async (payload) => { await api.addPilgrim(payload); await refresh(); },
        updatePilgrim: async (id, payload) => { await api.updatePilgrim(id, payload); await refresh(); },
        deletePilgrim: async (id) => { await api.deletePilgrim(id); await refresh(); },
        addPayment: async (payload) => { await api.addPayment(payload); await refresh(); },

        addLead: async (payload) => { await api.addLead(payload); await refresh(); },
        updateLead: async (id, payload) => { await api.updateLead(id, payload); await refresh(); },
        deleteLead: async (id) => { await api.deleteLead(id); await refresh(); },

        addPackage: async (payload) => { await api.addPackage(payload); await refresh(); },
        updatePackage: async (id, payload) => { await api.updatePackage(id, payload); await refresh(); },
        deletePackage: async (id) => { await api.deletePackage(id); await refresh(); },

        addUser: async (payload) => { await api.addUser(payload); await refresh(); },
        updateUser: async (id, payload) => { await api.updateUser(id, payload); await refresh(); },
        setUserPassword: async (id, password) => { await api.setUserPassword(id, password); await refresh(); },
        deleteUser: async (id) => { await api.deleteUser(id); await refresh(); },
        toggleUserStatus: async (id) => { await api.toggleUserStatus(id); await refresh(); },

        addDocument: async (payload) => { await api.addDocument(payload); await refresh(); },
        deleteDocument: async (id) => { await api.deleteDocument(id); await refresh(); },
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
