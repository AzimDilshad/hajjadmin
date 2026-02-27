import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PILGRIMS, PACKAGES } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  Inquiry: "bg-info/15 text-info border-info/20",
  Registered: "bg-primary/15 text-primary border-primary/20",
  "Visa Process": "bg-warning/15 text-warning border-warning/20",
  Completed: "bg-success/15 text-success border-success/20",
};

const Pilgrims = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const filtered = useMemo(() => {
    return PILGRIMS.filter((p) => {
      const matchesSearch = !search || 
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.mobile.includes(search) ||
        p.registration_no.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesPackage = packageFilter === "all" || p.package_id === packageFilter;
      return matchesSearch && matchesStatus && matchesPackage;
    });
  }, [search, statusFilter, packageFilter]);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Pilgrims</h1>
          <p className="text-muted-foreground text-sm mt-1">{PILGRIMS.length} total records</p>
        </div>
        {hasPermission("pilgrims.add") && (
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Pilgrim
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, or reg. no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Inquiry">Inquiry</SelectItem>
            <SelectItem value="Registered">Registered</SelectItem>
            <SelectItem value="Visa Process">Visa Process</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={packageFilter} onValueChange={setPackageFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Package" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Packages</SelectItem>
            {PACKAGES.map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.package_name} - {pkg.package_type}
              </SelectItem>
            ))}
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
                <th className="text-left p-3 font-semibold text-muted-foreground">Reg. No</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Name</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Mobile</th>
                <th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Package</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pilgrim) => {
                const pkg = PACKAGES.find((p) => p.id === pilgrim.package_id);
                return (
                  <tr
                    key={pilgrim.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs">{pilgrim.registration_no}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{pilgrim.full_name}</p>
                        <p className="text-xs text-muted-foreground">{pilgrim.departure_city}</p>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{pilgrim.mobile}</td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs">
                        {pkg?.package_name} — {pkg?.package_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[pilgrim.status]}`}>
                        {pilgrim.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/pilgrims/${pilgrim.id}`)}
                        className="gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No pilgrims found matching your criteria
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

export default Pilgrims;
