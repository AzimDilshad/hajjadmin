import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PACKAGES } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Package } from "lucide-react";
import type { Pilgrim } from "@/types";

interface AddPilgrimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPilgrim?: Pilgrim | null;
  onSave?: (data: Partial<Pilgrim>) => void;
}

const emptyForm = {
  full_name: "",
  passport_name: "",
  gender: "" as string,
  date_of_birth: "",
  mobile: "",
  email: "",
  address: "",
  blood_group: "",
  mahram_name: "",
  package_id: "",
  departure_city: "",
  room_type: "" as string,
  status: "Inquiry" as string,
  // Passport fields
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_place_of_issue: "",
};

export function AddPilgrimDialog({ open, onOpenChange, editPilgrim, onSave }: AddPilgrimDialogProps) {
  const [form, setForm] = useState(() => {
    if (editPilgrim) {
      return {
        ...emptyForm,
        full_name: editPilgrim.full_name,
        passport_name: editPilgrim.passport_name,
        gender: editPilgrim.gender,
        date_of_birth: editPilgrim.date_of_birth,
        mobile: editPilgrim.mobile,
        email: editPilgrim.email,
        address: editPilgrim.address,
        blood_group: editPilgrim.blood_group,
        mahram_name: editPilgrim.mahram_name || "",
        package_id: editPilgrim.package_id,
        departure_city: editPilgrim.departure_city,
        room_type: editPilgrim.room_type,
        status: editPilgrim.status,
      };
    }
    return { ...emptyForm };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.passport_name.trim()) e.passport_name = "Required";
    if (!form.gender) e.gender = "Required";
    if (!form.date_of_birth) e.date_of_birth = "Required";
    if (!form.mobile.trim()) e.mobile = "Required";
    if (!form.package_id) e.package_id = "Required";
    if (!form.departure_city.trim()) e.departure_city = "Required";
    if (!form.room_type) e.room_type = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    onSave?.(form as Partial<Pilgrim>);
    toast({ title: editPilgrim ? "Pilgrim Updated" : "Pilgrim Added", description: `${form.full_name} has been saved.` });
    onOpenChange(false);
    setForm({ ...emptyForm });
  };

  const Field = ({ label, name, required, type = "text", placeholder = "" }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={(form as any)[name]}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className={errors[name] ? "border-destructive" : ""}
      />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{editPilgrim ? "Edit Pilgrim" : "Add New Pilgrim"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="mt-2">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="personal" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Personal</TabsTrigger>
            <TabsTrigger value="passport" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Passport</TabsTrigger>
            <TabsTrigger value="package" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" />Package</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="full_name" required placeholder="Mohammed Rizwan Ahmed" />
              <Field label="Passport Name" name="passport_name" required placeholder="MOHAMMED RIZWAN AHMED" />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Gender <span className="text-destructive">*</span></Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger className={errors.gender ? "border-destructive" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Date of Birth" name="date_of_birth" required type="date" />
              <Field label="Mobile" name="mobile" required placeholder="+91 98765 43210" />
              <Field label="Email" name="email" type="email" placeholder="email@example.com" />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v) => set("blood_group", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Mahram Name" name="mahram_name" placeholder="For female pilgrims" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Address</Label>
              <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" rows={2} />
            </div>
          </TabsContent>

          <TabsContent value="passport" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Passport Number" name="passport_number" placeholder="T1234567" />
              <Field label="Place of Issue" name="passport_place_of_issue" placeholder="Hyderabad" />
              <Field label="Issue Date" name="passport_issue_date" type="date" />
              <Field label="Expiry Date" name="passport_expiry_date" type="date" />
            </div>
          </TabsContent>

          <TabsContent value="package" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Package <span className="text-destructive">*</span></Label>
                <Select value={form.package_id} onValueChange={(v) => set("package_id", v)}>
                  <SelectTrigger className={errors.package_id ? "border-destructive" : ""}><SelectValue placeholder="Select package" /></SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>{pkg.package_name} — {pkg.package_type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Departure City" name="departure_city" required placeholder="Hyderabad" />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Room Type <span className="text-destructive">*</span></Label>
                <Select value={form.room_type} onValueChange={(v) => set("room_type", v)}>
                  <SelectTrigger className={errors.room_type ? "border-destructive" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Triple">Triple</SelectItem>
                    <SelectItem value="Quad">Quad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inquiry">Inquiry</SelectItem>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Visa Process">Visa Process</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{editPilgrim ? "Update Pilgrim" : "Add Pilgrim"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
