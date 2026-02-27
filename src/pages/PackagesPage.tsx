import { AppLayout } from "@/components/AppLayout";
import { PACKAGES } from "@/data/mockData";
import { motion } from "framer-motion";
import { Star, Building2, Calendar, IndianRupee } from "lucide-react";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const typeColors: Record<string, string> = {
  Economy: "bg-secondary/15 text-secondary border-secondary/20",
  Deluxe: "bg-primary/15 text-primary border-primary/20",
  VIP: "bg-accent/15 text-accent border-accent/20",
};

const PackagesPage = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Packages</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage Hajj & Umrah packages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PACKAGES.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold font-heading">{pkg.package_name}</h3>
                <span className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColors[pkg.package_type]}`}>
                  {pkg.package_type}
                </span>
              </div>
              <Star className="h-5 w-5 text-accent" />
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>Makkah: {pkg.makkah_hotel}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>Madinah: {pkg.madinah_hotel}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{pkg.total_days} days</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold font-heading">{formatCurrency(pkg.base_price)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
};

export default PackagesPage;
