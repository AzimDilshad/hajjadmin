import { getDashboardStats } from "@/data/mockData";
import { AppLayout } from "@/components/AppLayout";
import { Users, Plane, Building2, IndianRupee, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

const statCards = [
  { key: "totalPilgrims", label: "Total Pilgrims", icon: Users, color: "primary" },
  { key: "hajjRegistrations", label: "Hajj Registrations", icon: Plane, color: "secondary" },
  { key: "umrahRegistrations", label: "Umrah Registrations", icon: Building2, color: "accent" },
  { key: "totalRevenue", label: "Total Revenue", icon: IndianRupee, isCurrency: true, color: "primary" },
  { key: "totalReceived", label: "Total Received", icon: TrendingUp, isCurrency: true, color: "success" },
  { key: "totalPending", label: "Total Pending", icon: Clock, isCurrency: true, color: "warning" },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const Dashboard = () => {
  const stats = getDashboardStats();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const value = stats[card.key as keyof typeof stats];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                  <p className="text-2xl font-bold font-heading mt-2">
                    {card.isCurrency ? formatCurrency(value as number) : value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${colorMap[card.color]}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
