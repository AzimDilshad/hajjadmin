import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, User, FileText, Package, CreditCard, FolderOpen, FileSpreadsheet, Upload, Trash2, Eye, FileArchive, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { exportPilgrimProfilePDF, exportPaymentStatementPDF, exportPilgrimExcel } from "@/lib/exportUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DocumentType } from "@/types";

const docTypes: DocumentType[] = ["Passport Copy", "Aadhar Copy", "Medical Certificate", "Visa Copy", "Ticket", "Photo", "Other"];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const PilgrimProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { pilgrims, packages, passportDetails, payments: allPayments, addPayment, documents, addDocument, deleteDocument } = useData();

  const pilgrim = pilgrims.find((p) => p.id === id);
  const passport = passportDetails.find((p) => p.pilgrim_id === id);
  const payments = allPayments.filter((p) => p.pilgrim_id === id);
  const pkg = pilgrim ? packages.find((p) => p.id === pilgrim.package_id) : undefined;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (pkg?.base_price || 0) - totalPaid;

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [uploadType, setUploadType] = useState<DocumentType>("Other");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const pilgrimDocuments = useMemo(() => documents.filter((d) => d.pilgrim_id === id), [documents, id]);

  if (!pilgrim) return <AppLayout><div className="text-center py-20 text-muted-foreground">Pilgrim not found</div></AppLayout>;

  const canManageDocuments = hasPermission("pilgrims.edit") || hasPermission("pilgrims.add") || hasPermission("users.manage");

  const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const exportSelectedDocs = () => {
    const docsToExport = pilgrimDocuments.filter((d) => selectedDocs.includes(d.id));
    if (!docsToExport.length) {
      toast({ title: "No documents selected", description: "Select at least one document to export.", variant: "destructive" });
      return;
    }
    const filePrefix = passport?.passport_number || pilgrim.registration_no;
    docsToExport.forEach((doc) => {
      if (!doc.data_url) return;
      const a = document.createElement("a");
      a.href = doc.data_url;
      a.download = `${filePrefix}_${doc.doc_type.replace(/\s+/g, "-")}_${doc.name}`;
      a.click();
    });
    toast({ title: "Documents Exported", description: `${docsToExport.length} document(s) downloaded.` });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      const payloads = await Promise.all(Array.from(files).map(async (file) => ({
        pilgrim_id: pilgrim.id,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        mime_type: file.type || "application/octet-stream",
        doc_type: uploadType,
        data_url: await toDataUrl(file),
      })));
      for (const payload of payloads) await addDocument(payload as any);
      toast({ title: "Documents Uploaded", description: `${files.length} ${uploadType} file(s) uploaded successfully.` });
    } catch {
      toast({ title: "Upload Failed", description: "Unable to upload one or more files.", variant: "destructive" });
    } finally {
      e.target.value = "";
    }
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/pilgrims")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div className="flex-1"><h1 className="text-xl font-bold font-heading">{pilgrim.full_name}</h1><p className="text-sm text-muted-foreground">{pilgrim.registration_no}</p></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />Export</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportPilgrimProfilePDF(pilgrim, passport, pkg, payments)}><FileText className="h-4 w-4 mr-2" />Full Profile (PDF)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPaymentStatementPDF(pilgrim, pkg, payments)}><CreditCard className="h-4 w-4 mr-2" />Payment Statement (PDF)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPilgrimExcel(pilgrim, passport, pkg, payments)}><FileSpreadsheet className="h-4 w-4 mr-2" />Complete Data (Excel)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasPermission("accounts.view") && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"><div className="bg-card rounded-xl border p-4"><p className="text-xs text-muted-foreground">Package Price</p><p className="text-lg font-bold font-heading mt-1">{formatCurrency(pkg?.base_price || 0)}</p></div><div className="bg-card rounded-xl border p-4"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-lg font-bold font-heading mt-1 text-success">{formatCurrency(totalPaid)}</p></div><div className="bg-card rounded-xl border p-4"><p className="text-xs text-muted-foreground">Balance</p><p className={`text-lg font-bold font-heading mt-1 ${balance > 0 ? "text-warning" : "text-success"}`}>{formatCurrency(balance)}</p></div></motion.div>}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 mb-4 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="basic" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Basic Info</TabsTrigger>
          <TabsTrigger value="passport" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Passport</TabsTrigger>
          <TabsTrigger value="package" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Package</TabsTrigger>
          {hasPermission("accounts.view") && <TabsTrigger value="payments" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" />Payments</TabsTrigger>}
          <TabsTrigger value="documents" className="gap-1.5 text-xs"><FolderOpen className="h-3.5 w-3.5" />Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5"><InfoRow label="Full Name" value={pilgrim.full_name} /><InfoRow label="Passport Name" value={pilgrim.passport_name} /><InfoRow label="Gender" value={pilgrim.gender} /><InfoRow label="Date of Birth" value={pilgrim.date_of_birth} /><InfoRow label="Mobile" value={pilgrim.mobile} /><InfoRow label="Email" value={pilgrim.email} /><InfoRow label="Address" value={pilgrim.address} /><InfoRow label="Blood Group" value={pilgrim.blood_group} /><InfoRow label="Mahram Name" value={pilgrim.mahram_name} /><InfoRow label="Departure City" value={pilgrim.departure_city} /><InfoRow label="Room Type" value={pilgrim.room_type} /><InfoRow label="Status" value={pilgrim.status} /></motion.div></TabsContent>
        <TabsContent value="passport"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5">{passport ? <><InfoRow label="Passport Number" value={passport.passport_number} /><InfoRow label="Issue Date" value={passport.issue_date} /><InfoRow label="Expiry Date" value={passport.expiry_date} /><InfoRow label="Place of Issue" value={passport.place_of_issue} /></> : <p className="text-muted-foreground text-sm py-4 text-center">No passport details recorded</p>}</motion.div></TabsContent>
        <TabsContent value="package"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5">{pkg ? <><InfoRow label="Package Name" value={pkg.package_name} /><InfoRow label="Package Type" value={pkg.package_type} /><InfoRow label="Package Tags" value={(pkg.tags || []).join(", ")} /><InfoRow label="Makkah Hotel" value={pkg.makkah_hotel} /><InfoRow label="Madinah Hotel" value={pkg.madinah_hotel} /><InfoRow label="Total Days" value={String(pkg.total_days)} /><InfoRow label="Base Price" value={formatCurrency(pkg.base_price)} /></> : <p className="text-muted-foreground text-sm py-4 text-center">No package assigned</p>}</motion.div></TabsContent>

        <TabsContent value="payments"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">{hasPermission("accounts.add") && <div className="p-4 border-b flex justify-between items-center"><Button size="sm" className="gap-1.5" onClick={() => setPaymentOpen(true)}><CreditCard className="h-3.5 w-3.5" />Add Payment</Button><Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportPaymentStatementPDF(pilgrim, pkg, payments)}><Download className="h-3.5 w-3.5" />Download Statement</Button></div>}<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-semibold text-muted-foreground">Date</th><th className="text-left p-3 font-semibold text-muted-foreground">Amount</th><th className="text-left p-3 font-semibold text-muted-foreground">Mode</th><th className="text-left p-3 font-semibold text-muted-foreground">Reference</th><th className="text-left p-3 font-semibold text-muted-foreground">Notes</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30"><td className="p-3">{payment.payment_date}</td><td className="p-3 font-medium">{formatCurrency(payment.amount)}</td><td className="p-3">{payment.payment_mode}</td><td className="p-3 font-mono text-xs">{payment.reference_no}</td><td className="p-3 text-muted-foreground">{payment.notes || "—"}</td></tr>)}{payments.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payments recorded</td></tr>}</tbody></table></div></motion.div></TabsContent>

        <TabsContent value="documents">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading font-semibold text-sm">Uploaded Documents ({pilgrimDocuments.length})</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedDocs(pilgrimDocuments.map((d) => d.id))}><CheckSquare className="h-3.5 w-3.5" />Select All</Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={exportSelectedDocs}><FileArchive className="h-3.5 w-3.5" />Export Selected</Button>
                </div>
              </div>

              {canManageDocuments && (
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={uploadType} onValueChange={(v) => setUploadType(v as DocumentType)}>
                    <SelectTrigger className="w-52"><SelectValue placeholder="Document type" /></SelectTrigger>
                    <SelectContent>{docTypes.map((dt) => <SelectItem key={dt} value={dt}>{dt}</SelectItem>)}</SelectContent>
                  </Select>
                  <label>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                    <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" asChild><span><Upload className="h-3.5 w-3.5" />Upload {uploadType}</span></Button>
                  </label>
                </div>
              )}
            </div>

            {pilgrimDocuments.length > 0 ? (
              <div className="space-y-2">
                {pilgrimDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 border gap-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedDocs.includes(doc.id)} onChange={(e) => setSelectedDocs((prev) => e.target.checked ? [...prev, doc.id] : prev.filter((x) => x !== doc.id))} />
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium block">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">{doc.doc_type} • {doc.size} • {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.data_url && <a href={doc.data_url} target="_blank" rel="noreferrer"><Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button></a>}
                      {doc.data_url && <a href={doc.data_url} download={doc.name}><Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button></a>}
                      {canManageDocuments && <Button variant="ghost" size="sm" onClick={async () => { await deleteDocument(doc.id); setSelectedDocs((p) => p.filter((x) => x !== doc.id)); toast({ title: "Document Deleted", description: `${doc.name} removed.` }); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8"><FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No documents uploaded yet</p><p className="text-muted-foreground text-xs mt-1">Upload PP copy, Aadhar, Medical, Visa, Ticket and other files.</p></div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      <AddPaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} pilgrimName={pilgrim.full_name} onSave={async (payment) => { await addPayment({ ...payment, pilgrim_id: pilgrim.id } as any); }} />
    </AppLayout>
  );
};

export default PilgrimProfile;
