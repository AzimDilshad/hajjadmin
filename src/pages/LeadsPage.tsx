import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types";

const sources = ["Walk-in", "Website", "Referral", "Social Media", "Call", "Other"] as const;
const interests = ["Hajj", "Umrah", "Both", "Not Sure"] as const;
const statuses = ["New", "Contacted", "Qualified", "Converted", "Closed"] as const;

const emptyLead: Partial<Lead> = {
  full_name: "",
  mobile: "",
  email: "",
  city: "",
  source: "Walk-in",
  interest: "Not Sure",
  budget: "",
  notes: "",
  status: "New",
  assigned_to: "",
  follow_up_date: "",
};

export default function LeadsPage() {
  const { leads, users, addLead, updateLead, deleteLead } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Partial<Lead>>({ ...emptyLead });

  const filtered = useMemo(() => leads.filter((l) => {
    const q = query.toLowerCase();
    const hit = !query || l.full_name.toLowerCase().includes(q) || l.mobile.includes(query) || (l.email || "").toLowerCase().includes(q) || (l.city || "").toLowerCase().includes(q);
    const statusOk = statusFilter === "all" || l.status === statusFilter;
    return hit && statusOk;
  }), [leads, query, statusFilter]);

  const startAdd = () => { setEditing(null); setForm({ ...emptyLead }); setOpen(true); };
  const startEdit = (lead: Lead) => { setEditing(lead); setForm({ ...lead }); setOpen(true); };

  const set = (k: keyof Lead, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name?.trim() || !form.mobile?.trim()) {
      toast({ title: "Validation Error", description: "Name and mobile are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      await updateLead(editing.id, form);
      toast({ title: "Lead Updated", description: `${form.full_name} updated successfully.` });
    } else {
      await addLead(form as any);
      toast({ title: "Lead Added", description: `${form.full_name} created successfully.` });
    }
    setOpen(false);
    setForm({ ...emptyLead });
    setEditing(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading">Leads</h1>
          <p className="text-sm text-muted-foreground">Dynamic Lead Information Management for enquiry to conversion.</p>
        </div>
        <Button className="gap-2" onClick={startAdd}><Plus className="h-4 w-4" />Add Lead</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name, mobile, city, email..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="text-left p-3">Lead</th><th className="text-left p-3">Interest</th><th className="text-left p-3">Source</th><th className="text-left p-3">Follow-up</th><th className="text-left p-3">Status</th><th className="text-left p-3">Assigned</th><th className="text-left p-3">Action</th></tr></thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3"><p className="font-medium">{lead.full_name}</p><p className="text-xs text-muted-foreground">{lead.mobile} {lead.city ? `• ${lead.city}` : ""}</p></td>
                  <td className="p-3">{lead.interest}</td>
                  <td className="p-3">{lead.source}</td>
                  <td className="p-3">{lead.follow_up_date || "—"}</td>
                  <td className="p-3"><span className="text-xs px-2 py-1 rounded-full border bg-muted">{lead.status}</span></td>
                  <td className="p-3">{lead.assigned_to || "Unassigned"}</td>
                  <td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => startEdit(lead)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={async () => { if (!window.confirm(`Delete ${lead.full_name}?`)) return; await deleteLead(lead.id); toast({ title: "Lead Deleted", description: `${lead.full_name} removed.` }); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No leads found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Lead" : "Add New Lead"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Full Name *</Label><Input value={form.full_name || ""} onChange={(e) => set("full_name", e.target.value)} /></div>
            <div><Label>Mobile *</Label><Input value={form.mobile || ""} onChange={(e) => set("mobile", e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} /></div>
            <div><Label>Source</Label><Select value={form.source || "Walk-in"} onValueChange={(v) => set("source", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Interest</Label><Select value={form.interest || "Not Sure"} onValueChange={(v) => set("interest", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{interests.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Status</Label><Select value={form.status || "New"} onValueChange={(v) => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Follow-up Date</Label><Input type="date" value={form.follow_up_date || ""} onChange={(e) => set("follow_up_date", e.target.value)} /></div>
            <div><Label>Assigned To</Label><Select value={form.assigned_to || ""} onValueChange={(v) => set("assigned_to", v)}><SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger><SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Budget</Label><Input value={form.budget || ""} onChange={(e) => set("budget", e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>{editing ? "Update Lead" : "Save Lead"}</Button></div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
