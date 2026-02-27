import { AppLayout } from "@/components/AppLayout";
import { PAYMENTS, PILGRIMS } from "@/data/mockData";
import { motion } from "framer-motion";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const PaymentsPage = () => {
  const allPayments = PAYMENTS.map((p) => ({
    ...p,
    pilgrim: PILGRIMS.find((pl) => pl.id === p.pilgrim_id),
  })).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">All payment transactions</p>
      </div>

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
                  <td className="p-3 hidden md:table-cell">{payment.payment_mode}</td>
                  <td className="p-3 font-mono text-xs hidden md:table-cell">{payment.reference_no}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{payment.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default PaymentsPage;
