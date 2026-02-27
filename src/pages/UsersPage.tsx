import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Shield, ShieldCheck, ShieldAlert, UserCog, Search, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "SuperAdmin" | "Manager" | "Accountant" | "DataEntry";
  branch?: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
}

const INITIAL_USERS: UserRecord[] = [
  { id: "1", name: "Admin User", email: "admin@goodhope.com", role: "SuperAdmin", status: "Active", lastLogin: "2026-02-27" },
  { id: "2", name: "Branch Manager", email: "manager@goodhope.com", role: "Manager", branch: "Hyderabad", status: "Active", lastLogin: "2026-02-26" },
  { id: "3", name: "Accounts Head", email: "accounts@goodhope.com", role: "Accountant", status: "Active", lastLogin: "2026-02-25" },
  { id: "4", name: "Data Entry Staff", email: "data@goodhope.com", role: "DataEntry", branch: "Bangalore", status: "Active", lastLogin: "2026-02-24" },
  { id: "5", name: "Asst. Manager", email: "asst.mgr@goodhope.com", role: "Manager", branch: "Mumbai", status: "Inactive" },
];

const roleConfig: Record<string, { icon: typeof Shield; color: string; permissions: string[] }> = {
  SuperAdmin: {
    icon: ShieldAlert,
    color: "bg-destructive/15 text-destructive border-destructive/20",
    permissions: ["Full system access", "User management", "Delete records", "All reports"],
  },
  Manager: {
    icon: ShieldCheck,
    color: "bg-primary/15 text-primary border-primary/20",
    permissions: ["Add/Edit pilgrims", "View accounts", "Manage packages", "Download reports"],
  },
  Accountant: {
    icon: Shield,
    color: "bg-success/15 text-success border-success/20",
    permissions: ["View pilgrims", "Add/Edit payments", "Download reports"],
  },
  DataEntry: {
    icon: UserCog,
    color: "bg-info/15 text-info border-info/20",
    permissions: ["Add pilgrims", "View pilgrims only"],
  },
};

const UsersPage = () => {
  const { hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "", branch: "" });

  if (!hasPermission("users.manage")) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">You don't have access to user management.</div>
      </AppLayout>
    );
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({ title: "Missing Fields", description: "Name, email and role are required.", variant: "destructive" });
      return;
    }
    const id = `u${Date.now()}`;
    setUsers((prev) => [
      ...prev,
      { id, name: newUser.name, email: newUser.email, role: newUser.role as any, branch: newUser.branch || undefined, status: "Active" as const },
    ]);
    toast({ title: "User Created", description: `${newUser.name} has been added as ${newUser.role}.` });
    setAddOpen(false);
    setNewUser({ name: "", email: "", role: "", branch: "" });
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" as const : "Active" as const } : u))
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} users configured</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(roleConfig).map(([role, config]) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <config.icon className="h-4 w-4" />
              <span className="font-semibold text-sm font-heading">{role}</span>
            </div>
            <ul className="space-y-1">
              {config.permissions.map((p) => (
                <li key={p} className="text-xs text-muted-foreground">• {p}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold text-muted-foreground">Name</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Email</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Role</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Branch</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Last Login</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const rc = roleConfig[u.role];
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rc.color}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{u.branch || "—"}</td>
                    <td className="p-3">
                      <Badge variant={u.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{u.lastLogin || "Never"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(u.id)} className="text-xs">
                          {u.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name <span className="text-destructive">*</span></Label>
              <Input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email <span className="text-destructive">*</span></Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} placeholder="user@goodhope.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role <span className="text-destructive">*</span></Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Accountant">Accountant</SelectItem>
                  <SelectItem value="DataEntry">DataEntry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Branch (optional)</Label>
              <Input value={newUser.branch} onChange={(e) => setNewUser((p) => ({ ...p, branch: e.target.value }))} placeholder="Hyderabad" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default UsersPage;
