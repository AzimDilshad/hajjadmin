import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Star, Building2, Calendar, IndianRupee, Plus, Pencil, Trash2, Tags } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const typeColors: Record<string, string> = {
  Economy: "bg-secondary/15 text-secondary border-secondary/20",
  Deluxe: "bg-primary/15 text-primary border-primary/20",
  VIP: "bg-accent/15 text-accent border-accent/20",
};

const emptyForm = {
  package_name: "",
  package_type: "",
  makkah_hotel: "",
  madinah_hotel: "",
  total_days: "",
  base_price: "",
  tags: "",
};

const PackagesPage = () => {
  const { packages, addPackage, updatePackage, deletePackage } = useData();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);

  const allTags = useMemo(
    () => Array.from(new Set(packages.flatMap((p) => p.tags || []))).sort((a, b) => a.localeCompare(b)),
    [packages]
  );

  const visiblePackages = useMemo(
    () => packages.filter((p) => tagFilter === "all" || (p.tags || []).includes(tagFilter)),
    [packages, tagFilter]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return;
    setEditingId(id);
    setForm({
      package_name: pkg.package_name,
      package_type: pkg.package_type,
      makkah_hotel: pkg.makkah_hotel,
      madinah_hotel: pkg.madinah_hotel,
      total_days: String(pkg.total_days),
      base_price: String(pkg.base_price),
      tags: (pkg.tags || []).join(", "),
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.package_name || !form.package_type || !form.makkah_hotel || !form.madinah_hotel || !form.total_days || !form.base_price) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    const payload = {
      package_name: form.package_name,
      package_type: form.package_type as "Economy" | "Deluxe" | "VIP",
      makkah_hotel: form.makkah_hotel,
      madinah_hotel: form.madinah_hotel,
      total_days: Number(form.total_days),
      base_price: Number(form.base_price),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updatePackage(editingId, payload);
        toast({ title: "Package updated", description: `${payload.package_name} has been updated.` });
      } else {
        await addPackage(payload as any);
        toast({ title: "Package added", description: `${payload.package_name} has been created.` });
      }
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      toast({ title: "Save failed", description: String((error as Error).message || "Unable to save package"), variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">Packages</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage Hajj & Umrah packages with tags, edit and delete</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />Add Package</Button>
      </div>

      <div className="mb-4 flex items-center gap-3 max-w-sm">
        <Tags className="h-4 w-4 text-muted-foreground" />
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger><SelectValue placeholder="Filter by tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePackages.map((pkg, i) => (
          <motion.div key={pkg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold font-heading">{pkg.package_name}</h3>
                <span className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColors[pkg.package_type]}`}>{pkg.package_type}</span>
              </div>
              <Star className="h-5 w-5 text-accent" />
            </div>

            {(pkg.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {(pkg.tags || []).map((tag) => <span key={tag} className="text-[10px] border rounded-full px-2 py-0.5 bg-muted/50">{tag}</span>)}
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-3.5 w-3.5" /><span>Makkah: {pkg.makkah_hotel}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-3.5 w-3.5" /><span>Madinah: {pkg.madinah_hotel}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /><span>{pkg.total_days} days</span></div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
              <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /><span className="text-lg font-bold font-heading">{formatCurrency(pkg.base_price)}</span></span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(pkg.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={async () => {
                  try {
                    await deletePackage(pkg.id);
                    toast({ title: "Package deleted", description: `${pkg.package_name} removed.` });
                  } catch (error) {
                    toast({ title: "Delete blocked", description: String((error as Error).message || "Unable to delete package"), variant: "destructive" });
                  }
                }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Package" : "Add Package"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Package Name *</Label><Input value={form.package_name} onChange={(e) => setForm((p) => ({ ...p, package_name: e.target.value }))} />
            <Label>Type *</Label>
            <Select value={form.package_type} onValueChange={(v) => setForm((p) => ({ ...p, package_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent><SelectItem value="Economy">Economy</SelectItem><SelectItem value="Deluxe">Deluxe</SelectItem><SelectItem value="VIP">VIP</SelectItem></SelectContent>
            </Select>
            <Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Hajj 2026, Group A, Premium" />
            <Label>Makkah Hotel *</Label><Input value={form.makkah_hotel} onChange={(e) => setForm((p) => ({ ...p, makkah_hotel: e.target.value }))} />
            <Label>Madinah Hotel *</Label><Input value={form.madinah_hotel} onChange={(e) => setForm((p) => ({ ...p, madinah_hotel: e.target.value }))} />
            <Label>Total Days *</Label><Input type="number" value={form.total_days} onChange={(e) => setForm((p) => ({ ...p, total_days: e.target.value }))} />
            <Label>Base Price *</Label><Input type="number" value={form.base_price} onChange={(e) => setForm((p) => ({ ...p, base_price: e.target.value }))} />
          </div>
          <div className="flex justify-end mt-4"><Button onClick={handleSave}>{editingId ? "Update Package" : "Save Package"}</Button></div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PackagesPage;
