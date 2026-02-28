import { ChangeEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/contexts/DataContext";
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
  photo_data_url: "",
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_place_of_issue: "",
};

function Field({
  label,
  name,
  value,
  required,
  type = "text",
  placeholder = "",
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  error?: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AddPilgrimDialog({ open, onOpenChange, editPilgrim, onSave }: AddPilgrimDialogProps) {
  const { packages, passportDetails } = useData();
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (!editPilgrim) {
      setForm({ ...emptyForm });
      setErrors({});
      return;
    }
    const passport = passportDetails.find((p) => p.pilgrim_id === editPilgrim.id);
    setForm({
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
      photo_data_url: editPilgrim.photo_data_url || "",
      passport_number: passport?.passport_number || "",
      passport_issue_date: passport?.issue_date || "",
      passport_expiry_date: passport?.expiry_date || "",
      passport_place_of_issue: passport?.place_of_issue || "",
    });
    setErrors({});
  }, [editPilgrim, open, passportDetails]);

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

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    set("photo_data_url", dataUrl);
    e.target.value = "";
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
              <Field label="Full Name" name="full_name" value={form.full_name} required placeholder="Mohammed Rizwan Ahmed" error={errors.full_name} onChange={set} />
              <Field label="Passport Name" name="passport_name" value={form.passport_name} required placeholder="MOHAMMED RIZWAN AHMED" error={errors.passport_name} onChange={set} />
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
              <Field label="Date of Birth" name="date_of_birth" value={form.date_of_birth} required type="date" error={errors.date_of_birth} onChange={set} />
              <Field label="Mobile" name="mobile" value={form.mobile} required placeholder="+91 98765 43210" error={errors.mobile} onChange={set} />
              <Field label="Email" name="email" value={form.email} type="email" placeholder="email@example.com" error={errors.email} onChange={set} />
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
              <Field label="Mahram Name" name="mahram_name" value={form.mahram_name} placeholder="For female pilgrims" onChange={set} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pilgrim Photo (Optional)</Label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                {form.photo_data_url && <img src={form.photo_data_url} alt="Pilgrim" className="h-14 w-14 rounded-md object-cover border" />}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Address</Label>
              <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" rows={2} />
            </div>
          </TabsContent>

          <TabsContent value="passport" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Passport Number" name="passport_number" value={form.passport_number} placeholder="T1234567" onChange={set} />
              <Field label="Place of Issue" name="passport_place_of_issue" value={form.passport_place_of_issue} placeholder="Hyderabad" onChange={set} />
              <Field label="Issue Date" name="passport_issue_date" value={form.passport_issue_date} type="date" onChange={set} />
              <Field label="Expiry Date" name="passport_expiry_date" value={form.passport_expiry_date} type="date" onChange={set} />
            </div>
          </TabsContent>

          <TabsContent value="package" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Package <span className="text-destructive">*</span></Label>
                <Select value={form.package_id} onValueChange={(v) => set("package_id", v)}>
                  <SelectTrigger className={errors.package_id ? "border-destructive" : ""}><SelectValue placeholder="Select package" /></SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>{pkg.package_name} — {pkg.package_type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Departure City" name="departure_city" value={form.departure_city} required placeholder="Hyderabad" error={errors.departure_city} onChange={set} />
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
