import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const { payments, pilgrims, expenses, packages, addExpense, deleteExpense } = useData();
  const [open, setOpen] = useState(false);
  const [expense, setExpense] = useState({ batch_id: "", title: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), category: "Operations", notes: "" });

  const totalReceived = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const net = totalReceived - totalExpenses;

  const byBatch = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.batch_id] = (map[e.batch_id] || 0) + Number(e.amount || 0);
    return map;
  }, [expenses]);

  const saveExpense = async () => {
    if (!expense.batch_id || !expense.title || !expense.amount) {
      toast({ title: "Validation Error", description: "Batch, title and amount are required.", variant: "destructive" });
      return;
    }
    await addExpense({ ...expense, amount: Number(expense.amount) } as any);
    toast({ title: "Expense Added", description: `${expense.title} recorded.` });
    setOpen(false);
    setExpense({ batch_id: "", title: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), category: "Operations", notes: "" });
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-bold font-heading">Accounts</h1><p className="text-sm text-muted-foreground">Professional accounts dashboard with pilgrim receipts and batch expenses.</p></div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Other Expense</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-card border rounded-lg p-4"><p className="text-xs text-muted-foreground">Total Received</p><p className="text-xl font-bold">₹{totalReceived.toLocaleString()}</p></div>
        <div className="bg-card border rounded-lg p-4"><p className="text-xs text-muted-foreground">Total Expenses</p><p className="text-xl font-bold">₹{totalExpenses.toLocaleString()}</p></div>
        <div className="bg-card border rounded-lg p-4"><p className="text-xs text-muted-foreground">Net Position</p><p className={`text-xl font-bold ${net >= 0 ? "text-success" : "text-destructive"}`}>₹{net.toLocaleString()}</p></div>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Pilgrim Payments</TabsTrigger>
          <TabsTrigger value="expenses">Other Expenses</TabsTrigger>
          <TabsTrigger value="batch">Batch Expense Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <div className="bg-card border rounded-xl overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-muted/40 border-b"><th className="text-left p-3">Pilgrim</th><th className="text-left p-3">Date</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Mode</th><th className="text-left p-3">Ref</th></tr></thead><tbody>
              {payments.map((p) => <tr key={p.id} className="border-b last:border-0"><td className="p-3">{pilgrims.find((x) => x.id === p.pilgrim_id)?.full_name || "—"}</td><td className="p-3">{p.payment_date}</td><td className="p-3">₹{p.amount.toLocaleString()}</td><td className="p-3">{p.payment_mode}</td><td className="p-3">{p.reference_no}</td></tr>)}
            </tbody></table>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="bg-card border rounded-xl overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-muted/40 border-b"><th className="text-left p-3">Batch</th><th className="text-left p-3">Title</th><th className="text-left p-3">Category</th><th className="text-left p-3">Date</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Action</th></tr></thead><tbody>
              {expenses.map((e) => <tr key={e.id} className="border-b last:border-0"><td className="p-3">{e.batch_id}</td><td className="p-3">{e.title}</td><td className="p-3">{e.category}</td><td className="p-3">{e.expense_date}</td><td className="p-3">₹{Number(e.amount).toLocaleString()}</td><td className="p-3"><Button variant="ghost" size="sm" onClick={async () => { await deleteExpense(e.id); toast({ title: "Expense Deleted" }); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td></tr>)}
            </tbody></table>
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <div className="bg-card border rounded-xl overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-muted/40 border-b"><th className="text-left p-3">Batch</th><th className="text-left p-3">Package</th><th className="text-left p-3">Expense</th></tr></thead><tbody>
              {Object.entries(byBatch).map(([batchId, total]) => <tr key={batchId} className="border-b last:border-0"><td className="p-3">{batchId}</td><td className="p-3">{packages.find((p) => p.id === batchId)?.package_name || "Custom Batch"}</td><td className="p-3">₹{total.toLocaleString()}</td></tr>)}
            </tbody></table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Other Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Batch / Package</Label><Select value={expense.batch_id} onValueChange={(v) => setExpense((s) => ({ ...s, batch_id: v }))}><SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent>{packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.package_name} — {p.package_type}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Title</Label><Input value={expense.title} onChange={(e) => setExpense((s) => ({ ...s, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2"><div><Label>Amount</Label><Input type="number" value={expense.amount} onChange={(e) => setExpense((s) => ({ ...s, amount: e.target.value }))} /></div><div><Label>Date</Label><Input type="date" value={expense.expense_date} onChange={(e) => setExpense((s) => ({ ...s, expense_date: e.target.value }))} /></div></div>
            <div><Label>Category</Label><Input value={expense.category} onChange={(e) => setExpense((s) => ({ ...s, category: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea rows={3} value={expense.notes} onChange={(e) => setExpense((s) => ({ ...s, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={saveExpense}>Save Expense</Button></div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
