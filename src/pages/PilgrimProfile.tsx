import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PILGRIMS, PACKAGES, getPilgrimPayments, getPilgrimPassport } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, User, FileText, Package, CreditCard, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const PilgrimProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const pilgrim = PILGRIMS.find((p) => p.id === id);
  const passport = getPilgrimPassport(id || "");
  const payments = getPilgrimPayments(id || "");
  const pkg = pilgrim ? PACKAGES.find((p) => p.id === pilgrim.package_id) : undefined;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (pkg?.base_price || 0) - totalPaid;

  if (!pilgrim) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">Pilgrim not found</div>
      </AppLayout>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/pilgrims")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-heading">{pilgrim.full_name}</h1>
          <p className="text-sm text-muted-foreground">{pilgrim.registration_no}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </div>

      {/* Account Summary Cards */}
      {hasPermission("accounts.view") && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-card rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Package Price</p>
            <p className="text-lg font-bold font-heading mt-1">{formatCurrency(pkg?.base_price || 0)}</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold font-heading mt-1 text-success">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold font-heading mt-1 ${balance > 0 ? "text-warning" : "text-success"}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 mb-4 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="basic" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Basic Info</TabsTrigger>
          <TabsTrigger value="passport" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Passport</TabsTrigger>
          <TabsTrigger value="package" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Package</TabsTrigger>
          {hasPermission("accounts.view") && (
            <TabsTrigger value="payments" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" />Payments</TabsTrigger>
          )}
          <TabsTrigger value="documents" className="gap-1.5 text-xs"><FolderOpen className="h-3.5 w-3.5" />Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5">
            <InfoRow label="Full Name" value={pilgrim.full_name} />
            <InfoRow label="Passport Name" value={pilgrim.passport_name} />
            <InfoRow label="Gender" value={pilgrim.gender} />
            <InfoRow label="Date of Birth" value={pilgrim.date_of_birth} />
            <InfoRow label="Mobile" value={pilgrim.mobile} />
            <InfoRow label="Email" value={pilgrim.email} />
            <InfoRow label="Address" value={pilgrim.address} />
            <InfoRow label="Blood Group" value={pilgrim.blood_group} />
            <InfoRow label="Mahram" value={pilgrim.mahram_name} />
            <InfoRow label="Departure City" value={pilgrim.departure_city} />
            <InfoRow label="Room Type" value={pilgrim.room_type} />
            <InfoRow label="Status" value={pilgrim.status} />
          </motion.div>
        </TabsContent>

        <TabsContent value="passport">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5">
            {passport ? (
              <>
                <InfoRow label="Passport Number" value={passport.passport_number} />
                <InfoRow label="Issue Date" value={passport.issue_date} />
                <InfoRow label="Expiry Date" value={passport.expiry_date} />
                <InfoRow label="Place of Issue" value={passport.place_of_issue} />
              </>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">No passport details recorded</p>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="package">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5">
            {pkg ? (
              <>
                <InfoRow label="Package Name" value={pkg.package_name} />
                <InfoRow label="Package Type" value={pkg.package_type} />
                <InfoRow label="Makkah Hotel" value={pkg.makkah_hotel} />
                <InfoRow label="Madinah Hotel" value={pkg.madinah_hotel} />
                <InfoRow label="Total Days" value={String(pkg.total_days)} />
                <InfoRow label="Base Price" value={formatCurrency(pkg.base_price)} />
              </>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">No package assigned</p>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="payments">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">
            {hasPermission("accounts.add") && (
              <div className="p-4 border-b">
                <Button size="sm" className="gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Add Payment
                </Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Mode</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Reference</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">{payment.payment_date}</td>
                      <td className="p-3 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="p-3">{payment.payment_mode}</td>
                      <td className="p-3 font-mono text-xs">{payment.reference_no}</td>
                      <td className="p-3 text-muted-foreground">{payment.notes || "—"}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No payments recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="documents">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-8 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Document upload will be available with cloud storage</p>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default PilgrimProfile;
