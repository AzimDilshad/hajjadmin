import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PAYMENTS, PILGRIMS } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, IndianRupee, TrendingUp, CreditCard, Eye } from "lucide-react";
import { motion } from "framer-motion";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const PaymentsPage = () => {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const navigate = useNavigate();

  const allPayments = useMemo(() => {
    return PAYMENTS.map((p) => ({
      ...p,
      pilgrim: PILGRIMS.find((pl) => pl.id === p.pilgrim_id),
    }))
      .filter((p) => {
        const matchesSearch =
          !search ||
          p.pilgrim?.full_name.toLowerCase().includes(search.toLowerCase()) ||
          p.reference_no.toLowerCase().includes(search.toLowerCase()) ||
          p.pilgrim?.registration_no.toLowerCase().includes(search.toLowerCase());
        const matchesMode = modeFilter === "all" || p.payment_mode === modeFilter;
        return matchesSearch && matchesMode;
      })
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }, [search, modeFilter]);

  const totalAmount = allPayments.reduce((s, p) => s + p.amount, 0);
  const cashTotal = allPayments.filter((p) => p.payment_mode === "Cash").reduce((s, p) => s + p.amount, 0);
  const digitalTotal = allPayments.filter((p) => p.payment_mode !== "Cash").reduce((s, p) => s + p.amount, 0);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">{PAYMENTS.length} total transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Total Collected</p>
          </div>
          <p className="text-lg font-bold font-heading">{formatCurrency(totalAmount)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-secondary" />
            <p className="text-xs text-muted-foreground">Digital Payments</p>
          </div>
          <p className="text-lg font-bold font-heading">{formatCurrency(digitalTotal)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="text-xs text-muted-foreground">Cash Payments</p>
          </div>
          <p className="text-lg font-bold font-heading">{formatCurrency(cashTotal)}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by pilgrim name, reg no, or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Payment Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Pilgrim</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Mode</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Reference</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Notes</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">{payment.payment_date}</td>
                  <td className="p-3">
                    <p className="font-medium">{payment.pilgrim?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{payment.pilgrim?.registration_no}</p>
                  </td>
                  <td className="p-3 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                      {payment.payment_mode}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs hidden md:table-cell">{payment.reference_no}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{payment.notes || "—"}</td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/pilgrims/${payment.pilgrim_id}`)}
                      className="gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {allPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No payments match your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default PaymentsPage;
