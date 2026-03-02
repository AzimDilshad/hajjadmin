const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getAuthToken() {
  return sessionStorage.getItem("auth_token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) => request<{ user: any; permissions: string[]; token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  bootstrap: () => request<any>("/bootstrap"),

  addPackage: (payload: any) => request<any>("/packages", { method: "POST", body: JSON.stringify(payload) }),
  updatePackage: (id: string, payload: any) => request<any>(`/packages/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deletePackage: (id: string) => request<any>(`/packages/${id}`, { method: "DELETE" }),

  addPilgrim: (payload: any) => request<any>("/pilgrims", { method: "POST", body: JSON.stringify(payload) }),
  updatePilgrim: (id: string, payload: any) => request<any>(`/pilgrims/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deletePilgrim: (id: string) => request<any>(`/pilgrims/${id}`, { method: "DELETE" }),
  addPayment: (payload: any) => request<any>("/payments", { method: "POST", body: JSON.stringify(payload) }),

  addExpense: (payload: any) => request<any>("/expenses", { method: "POST", body: JSON.stringify(payload) }),
  updateExpense: (id: string, payload: any) => request<any>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteExpense: (id: string) => request<any>(`/expenses/${id}`, { method: "DELETE" }),

  addLead: (payload: any) => request<any>("/leads", { method: "POST", body: JSON.stringify(payload) }),
  updateLead: (id: string, payload: any) => request<any>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteLead: (id: string) => request<any>(`/leads/${id}`, { method: "DELETE" }),
  convertLead: (id: string, payload: { package_id: string }) => request<any>(`/leads/${id}/convert`, { method: "POST", body: JSON.stringify(payload) }),

  upsertMedicalReport: (pilgrimId: string, payload: any) => request<any>(`/medical-reports/${pilgrimId}`, { method: "PUT", body: JSON.stringify(payload) }),

  addVaccineTemplate: (payload: any) => request<any>("/vaccine-templates", { method: "POST", body: JSON.stringify(payload) }),
  updateVaccineTemplate: (id: string, payload: any) => request<any>(`/vaccine-templates/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteVaccineTemplate: (id: string) => request<any>(`/vaccine-templates/${id}`, { method: "DELETE" }),

  addDocument: (payload: any) => request<any>("/documents", { method: "POST", body: JSON.stringify(payload) }),
  deleteDocument: (id: string) => request<any>(`/documents/${id}`, { method: "DELETE" }),

  addUser: (payload: any) => request<any>("/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id: string, payload: any) => request<any>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  setUserPassword: (id: string, password: string) => request<any>(`/users/${id}/password`, { method: "PATCH", body: JSON.stringify({ password }) }),
  deleteUser: (id: string) => request<any>(`/users/${id}`, { method: "DELETE" }),
  toggleUserStatus: (id: string) => request<any>(`/users/${id}/status`, { method: "PATCH" }),
};
