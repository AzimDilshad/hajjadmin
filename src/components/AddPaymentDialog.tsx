import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilgrimName?: string;
  onSave?: (data: { amount: number; payment_date: string; payment_mode: string; reference_no: string; notes: string }) => void;
}

export function AddPaymentDialog({ open, onOpenChange, pilgrimName, onSave }: AddPaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mode, setMode] = useState("");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!amount || !mode || !date) {
      toast({ title: "Missing Fields", description: "Amount, date and payment mode are required.", variant: "destructive" });
      return;
    }
    onSave?.({ amount: Number(amount), payment_date: date, payment_mode: mode, reference_no: ref, notes });
    toast({ title: "Payment Added", description: `₹${Number(amount).toLocaleString("en-IN")} payment recorded.` });
    onOpenChange(false);
    setAmount(""); setMode(""); setRef(""); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Payment{pilgrimName ? ` — ${pilgrimName}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Amount (₹) <span className="text-destructive">*</span></Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Payment Date <span className="text-destructive">*</span></Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Payment Mode <span className="text-destructive">*</span></Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Reference No.</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="BT-001 / UPI-002" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Payment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
