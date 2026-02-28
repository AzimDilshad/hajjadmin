import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Eye, FileSpreadsheet, FileArchive, Pencil, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AddPilgrimDialog } from "@/components/AddPilgrimDialog";
import { exportAllPilgrimsExcel } from "@/lib/exportUtils";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { DocumentType, Pilgrim } from "@/types";

const statusColors: Record<string, string> = {
  Inquiry: "bg-info/15 text-info border-info/20",
  Registered: "bg-primary/15 text-primary border-primary/20",
  "Visa Process": "bg-warning/15 text-warning border-warning/20",
  Completed: "bg-success/15 text-success border-success/20",
};

const docTypes: (DocumentType | "all")[] = ["all", "Passport Copy", "Aadhar Copy", "Medical Certificate", "Visa Copy", "Ticket", "Photo", "Other"];

const Pilgrims = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [tagSort, setTagSort] = useState("none");
  const [tagFilter, setTagFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [docsExportOpen, setDocsExportOpen] = useState(false);
  const [editPilgrim, setEditPilgrim] = useState<Pilgrim | null>(null);
  const [selectedPilgrimId, setSelectedPilgrimId] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | "all">("all");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const { pilgrims, packages, payments, documents, passportDetails, addPilgrim, updatePilgrim, deletePilgrim } = useData();

  useEffect(() => {
    if (searchParams.get("action") === "add" && hasPermission("pilgrims.add")) setAddOpen(true);
  }, [searchParams, hasPermission]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    packages.forEach((p) => (p.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [packages]);

  const filtered = useMemo(() => {
    const base = pilgrims.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = !search || p.full_name.toLowerCase().includes(q) || p.mobile.includes(search) || p.registration_no.toLowerCase().includes(q) || p.passport_name.toLowerCase().includes(q);
      const pkg = packages.find((x) => x.id === p.package_id);
      const matchesTag = tagFilter === "all" || (pkg?.tags || []).includes(tagFilter);
      return matchesSearch && matchesTag && (statusFilter === "all" || p.status === statusFilter) && (packageFilter === "all" || p.package_id === packageFilter);
    });
    if (tagSort === "none") return base;
    return [...base].sort((a, b) => {
      const aTag = (packages.find((p) => p.id === a.package_id)?.tags || []).join(", ");
      const bTag = (packages.find((p) => p.id === b.package_id)?.tags || []).join(", ");
      return tagSort === "asc" ? aTag.localeCompare(bTag) : bTag.localeCompare(aTag);
    });
  }, [search, statusFilter, packageFilter, pilgrims, tagSort, tagFilter, packages]);

  const pilgrimsForExport = useMemo(() => {
    if (tagFilter === "all") return pilgrims;
    return pilgrims.filter((p) => (packages.find((pkg) => pkg.id === p.package_id)?.tags || []).includes(tagFilter));
  }, [pilgrims, packages, tagFilter]);

  const docsForSelectedPilgrim = useMemo(() => {
    const byPilgrim = documents.filter((d) => d.pilgrim_id === selectedPilgrimId);
    return docTypeFilter === "all" ? byPilgrim : byPilgrim.filter((d) => d.doc_type === docTypeFilter);
  }, [documents, selectedPilgrimId, docTypeFilter]);

  const exportSelectedDocuments = () => {
    const selected = docsForSelectedPilgrim.filter((d) => selectedDocIds.includes(d.id));
    if (!selected.length) return toast({ title: "No documents selected", description: "Select one or more documents to export.", variant: "destructive" });
    const passportNo = passportDetails.find((p) => p.pilgrim_id === selectedPilgrimId)?.passport_number || "UNKNOWN";
    selected.forEach((doc) => {
      if (!doc.data_url) return;
      const a = document.createElement("a");
      a.href = doc.data_url;
      a.download = `${passportNo}_${doc.doc_type.replace(/\s+/g, "-")}_${doc.name}`;
      a.click();
    });
    toast({ title: "Export Complete", description: `${selected.length} document(s) downloaded.` });
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold font-heading">Pilgrims</h1><p className="text-muted-foreground text-sm mt-1">{pilgrims.length} total records</p></div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportAllPilgrimsExcel(pilgrimsForExport, packages, payments)}><FileSpreadsheet className="h-3.5 w-3.5" />Export All</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDocsExportOpen(true)}><FileArchive className="h-3.5 w-3.5" />Export Documents</Button>
          {hasPermission("pilgrims.add") && <Button className="gap-2" onClick={() => { setEditPilgrim(null); setAddOpen(true); }}><Plus className="h-4 w-4" />Add Pilgrim</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <div className="relative sm:col-span-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name, mobile, passport, or reg. no..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Inquiry">Inquiry</SelectItem><SelectItem value="Registered">Registered</SelectItem><SelectItem value="Visa Process">Visa Process</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select>
        <Select value={packageFilter} onValueChange={setPackageFilter}><SelectTrigger><SelectValue placeholder="Package" /></SelectTrigger><SelectContent><SelectItem value="all">All Packages</SelectItem>{packages.map((pkg) => <SelectItem key={pkg.id} value={pkg.id}>{pkg.package_name} - {pkg.package_type}</SelectItem>)}</SelectContent></Select>
        <div className="flex gap-2">
          <Select value={tagFilter} onValueChange={setTagFilter}><SelectTrigger><SelectValue placeholder="Tag filter" /></SelectTrigger><SelectContent><SelectItem value="all">All Tags</SelectItem>{allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}</SelectContent></Select>
          <Select value={tagSort} onValueChange={setTagSort}><SelectTrigger><SelectValue placeholder="Tag sort" /></SelectTrigger><SelectContent><SelectItem value="none">No Sort</SelectItem><SelectItem value="asc">Tag A-Z</SelectItem><SelectItem value="desc">Tag Z-A</SelectItem></SelectContent></Select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-semibold text-muted-foreground">Reg. No</th><th className="text-left p-3 font-semibold text-muted-foreground">Name</th><th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Mobile</th><th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Package</th><th className="text-left p-3 font-semibold text-muted-foreground">Status</th><th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Docs</th><th className="text-left p-3 font-semibold text-muted-foreground">Action</th></tr></thead><tbody>
          {filtered.map((pilgrim) => {
            const pkg = packages.find((p) => p.id === pilgrim.package_id);
            const docCount = documents.filter((d) => d.pilgrim_id === pilgrim.id).length;
            return <tr key={pilgrim.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors"><td className="p-3 font-mono text-xs">{pilgrim.registration_no}</td><td className="p-3"><p className="font-medium">{pilgrim.full_name}</p><p className="text-xs text-muted-foreground">{(pkg?.tags || []).join(", ") || "No tags"}</p></td><td className="p-3 hidden md:table-cell text-muted-foreground">{pilgrim.mobile}</td><td className="p-3 hidden lg:table-cell"><span className="text-xs">{pkg?.package_name} — {pkg?.package_type}</span></td><td className="p-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[pilgrim.status]}`}>{pilgrim.status}</span></td><td className="p-3 hidden md:table-cell"><span className={`text-xs font-medium ${docCount > 0 ? "text-success" : "text-warning"}`}>{docCount} file(s)</span></td><td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => navigate(`/pilgrims/${pilgrim.id}`)} className="gap-1.5"><Eye className="h-3.5 w-3.5" />View</Button>{hasPermission("pilgrims.edit") && <Button variant="ghost" size="sm" onClick={() => { setEditPilgrim(pilgrim); setAddOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>}{hasPermission("pilgrims.delete") && <Button variant="ghost" size="sm" onClick={async () => { if (!window.confirm(`Delete ${pilgrim.full_name}?`)) return; await deletePilgrim(pilgrim.id); toast({ title: "Pilgrim Deleted", description: `${pilgrim.full_name} deleted.` }); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}</div></td></tr>;
          })}
        </tbody></table></div>
      </motion.div>

      <AddPilgrimDialog open={addOpen} onOpenChange={setAddOpen} editPilgrim={editPilgrim} onSave={async (data) => {
        if (editPilgrim) await updatePilgrim(editPilgrim.id, data as any);
        else await addPilgrim(data as any);
        setEditPilgrim(null);
        setAddOpen(false);
      }} />

      <Dialog open={docsExportOpen} onOpenChange={setDocsExportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Export Pilgrim Documents</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Tags</SelectItem>{allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={docTypeFilter} onValueChange={(v) => setDocTypeFilter(v as DocumentType | "all")}>
                <SelectTrigger><SelectValue placeholder="Document type" /></SelectTrigger>
                <SelectContent>{docTypes.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "All Types" : t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <Select value={selectedPilgrimId} onValueChange={(v) => { setSelectedPilgrimId(v); setSelectedDocIds([]); }}>
              <SelectTrigger><SelectValue placeholder="Select pilgrim" /></SelectTrigger>
              <SelectContent>{pilgrimsForExport.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.registration_no})</SelectItem>)}</SelectContent>
            </Select>

            {selectedPilgrimId && (
              <div className="max-h-56 overflow-y-auto space-y-2 border rounded-lg p-3">
                {docsForSelectedPilgrim.length > 0 ? docsForSelectedPilgrim.map((doc) => (
                  <label key={doc.id} className="flex items-center justify-between gap-3 text-sm border-b pb-2 last:border-0">
                    <span>{doc.name} <span className="text-xs text-muted-foreground">({doc.doc_type})</span></span>
                    <input type="checkbox" checked={selectedDocIds.includes(doc.id)} onChange={(e) => setSelectedDocIds((prev) => e.target.checked ? [...prev, doc.id] : prev.filter((x) => x !== doc.id))} />
                  </label>
                )) : <p className="text-sm text-muted-foreground">No documents found for selected filters.</p>}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDocsExportOpen(false)}>Close</Button><Button onClick={exportSelectedDocuments}>Export Selected</Button></div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Pilgrims;
