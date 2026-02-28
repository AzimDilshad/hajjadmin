import { useMemo, useState } from "react";
import { useData, UserRecord } from "@/contexts/DataContext";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Shield, ShieldCheck, ShieldAlert, UserCog, Search, Pencil, Trash2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const roleConfig: Record<string, { icon: typeof Shield; color: string; permissions: string[] }> = {
  SuperAdmin: { icon: ShieldAlert, color: "bg-destructive/15 text-destructive border-destructive/20", permissions: ["Full system access", "User management", "Delete records", "All reports"] },
  Manager: { icon: ShieldCheck, color: "bg-primary/15 text-primary border-primary/20", permissions: ["Add/Edit pilgrims", "View accounts", "Manage packages", "Download reports"] },
  Accountant: { icon: Shield, color: "bg-success/15 text-success border-success/20", permissions: ["View pilgrims", "Add/Edit payments", "Download reports"] },
  DataEntry: { icon: UserCog, color: "bg-info/15 text-info border-info/20", permissions: ["Add pilgrims", "View pilgrims only"] },
};

const emptyForm = { name: "", email: "", role: "", branch: "" };

const UsersPage = () => {
  const { hasPermission, user: currentUser } = useAuth();
  const { users, addUser, updateUser, setUserPassword, deleteUser, toggleUserStatus } = useData();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState(emptyForm);

  if (!hasPermission("users.manage")) {
    return <AppLayout><div className="text-center py-20 text-muted-foreground">You don't have access to user management.</div></AppLayout>;
  }

  const filtered = useMemo(() => users.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())), [users, search]);

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.role) return toast({ title: "Missing Fields", description: "Name, email and role are required.", variant: "destructive" });
    await addUser({ name: form.name, email: form.email, role: form.role as any, branch: form.branch || undefined, status: "Active" });
    toast({ title: "User Created", description: `${form.name} has been added as ${form.role}.` });
    setForm(emptyForm); setAddOpen(false);
  };

  const openEdit = (u: UserRecord) => { setTargetUser(u); setForm({ name: u.name, email: u.email, role: u.role, branch: u.branch || "" }); setEditOpen(true); };

  const handleUpdateUser = async () => {
    if (!targetUser) return;
    await updateUser(targetUser.id, { name: form.name, email: form.email, role: form.role as any, branch: form.branch || undefined });
    toast({ title: "User Updated", description: `${form.name} updated successfully.` });
    setEditOpen(false); setTargetUser(null);
  };

  const handleResetPassword = async () => {
    if (!targetUser) return;
    if (newPassword.length < 4) return toast({ title: "Weak Password", description: "Password must be at least 4 characters.", variant: "destructive" });
    await setUserPassword(targetUser.id, newPassword);
    toast({ title: "Password Updated", description: `Password changed for ${targetUser.name}.` });
    setPasswordOpen(false); setTargetUser(null); setNewPassword("");
  };

  const handleDeleteUser = async (u: UserRecord) => {
    if (u.email === currentUser?.email) return toast({ title: "Blocked", description: "You cannot delete your own logged-in user.", variant: "destructive" });
    if (!confirm(`Delete user ${u.name}? This action cannot be undone.`)) return;
    await deleteUser(u.id);
    toast({ title: "User Deleted", description: `${u.name} removed.` });
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold font-heading">User Management</h1><p className="text-muted-foreground text-sm mt-1">{users.length} users configured</p></div>
        <Button className="gap-2 shrink-0" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus className="h-4 w-4" />Add User</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(roleConfig).map(([role, config]) => <motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-4"><div className="flex items-center gap-2 mb-2"><config.icon className="h-4 w-4" /><span className="font-semibold text-sm font-heading">{role}</span></div><ul className="space-y-1">{config.permissions.map((p) => <li key={p} className="text-xs text-muted-foreground">• {p}</li>)}</ul></motion.div>)}
      </div>

      <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-semibold text-muted-foreground">Name</th><th className="text-left p-3 font-semibold text-muted-foreground">Email</th><th className="text-left p-3 font-semibold text-muted-foreground">Role</th><th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Branch</th><th className="text-left p-3 font-semibold text-muted-foreground">Status</th><th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Last Login</th><th className="text-left p-3 font-semibold text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {filtered.map((u) => {
                const rc = roleConfig[u.role];
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rc.color}`}>{u.role}</span></td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{u.branch || "—"}</td>
                    <td className="p-3"><Badge variant={u.status === "Active" ? "default" : "secondary"} className="text-xs">{u.status}</Badge></td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{u.lastLogin || "Never"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(u.id)}>{u.status === "Active" ? "Deactivate" : "Activate"}</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setTargetUser(u); setPasswordOpen(true); }}><KeyRound className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="font-heading">Add New User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-xs">Full Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Role *</Label><Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="SuperAdmin">SuperAdmin</SelectItem><SelectItem value="Manager">Manager</SelectItem><SelectItem value="Accountant">Accountant</SelectItem><SelectItem value="DataEntry">DataEntry</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs">Branch</Label><Input value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t"><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={handleAddUser}>Create User</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="font-heading">Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-xs">Full Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Role *</Label><Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="SuperAdmin">SuperAdmin</SelectItem><SelectItem value="Manager">Manager</SelectItem><SelectItem value="Accountant">Accountant</SelectItem><SelectItem value="DataEntry">DataEntry</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label className="text-xs">Branch</Label><Input value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t"><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={handleUpdateUser}>Save Changes</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="font-heading">Set New Password</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs">New Password *</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t"><Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button><Button onClick={handleResetPassword}>Update Password</Button></div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default UsersPage;
