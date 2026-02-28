import { useData } from "@/contexts/DataContext";
import { AppLayout } from "@/components/AppLayout";
import { Users, Plane, Building2, IndianRupee, TrendingUp, Clock, ArrowRight, AlertTriangle, FileWarning, FileClock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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

const STATUS_COLORS: Record<string, string> = {
  Inquiry: "hsl(210, 70%, 50%)",
  Registered: "hsl(48, 50%, 35%)",
  "Visa Process": "hsl(38, 92%, 50%)",
  Completed: "hsl(152, 60%, 40%)",
};

const Dashboard = () => {
  const { stats, pilgrims: PILGRIMS, payments: PAYMENTS, packages: PACKAGES, passportDetails, documents, leads } = useData();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // Status breakdown for pie chart
  const statusData = Object.entries(
    PILGRIMS.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Recent payments (last 5)
  const recentPayments = [...PAYMENTS]
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5)
    .map((p) => ({
      ...p,
      pilgrim: PILGRIMS.find((pl) => pl.id === p.pilgrim_id),
    }));

  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const expiringPassports = passportDetails
    .filter((pp) => {
      const expiry = new Date(pp.expiry_date);
      return expiry >= now && expiry <= sixMonthsFromNow;
    })
    .map((pp) => ({
      ...pp,
      pilgrim: PILGRIMS.find((p) => p.id === pp.pilgrim_id),
    }))
    .slice(0, 5);

  const pilgrimsMissingDocs = PILGRIMS
    .filter((p) => !documents.some((d) => d.pilgrim_id === p.id))
    .slice(0, 5);

  // Pilgrims with pending balance

  const leadStats = {
    total: leads.length,
    converted: leads.filter((l) => l.status === "Converted").length,
    followUps: leads.filter((l) => l.follow_up_date).length,
  };

  const pendingPilgrims = PILGRIMS.map((p) => {
    const pkg = PACKAGES.find((pk) => pk.id === p.package_id);
    const paid = PAYMENTS.filter((pay) => pay.pilgrim_id === p.id).reduce((s, pay) => s + pay.amount, 0);
    const balance = (pkg?.base_price || 0) - paid;
    return { ...p, balance, packagePrice: pkg?.base_price || 0 };
  })
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your operations •{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border font-mono">Ctrl+K</kbd>{" "}
            to search
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => {
          const value = stats[card.key as keyof typeof stats];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileClock className="h-4 w-4 text-warning" />
            <h3 className="font-bold font-heading text-sm">Passports Expiring in 6 Months</h3>
          </div>
          {expiringPassports.length > 0 ? expiringPassports.map((pp) => (
            <div key={pp.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{pp.pilgrim?.full_name || "Unknown Pilgrim"}</p>
                <p className="text-xs text-muted-foreground">{pp.passport_number}</p>
              </div>
              <p className="text-xs text-warning font-semibold">{pp.expiry_date}</p>
            </div>
          )) : <p className="text-sm text-muted-foreground">No passports expiring soon.</p>}
        </div>

        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileWarning className="h-4 w-4 text-destructive" />
            <h3 className="font-bold font-heading text-sm">Pilgrims Missing Documents</h3>
          </div>
          {pilgrimsMissingDocs.length > 0 ? pilgrimsMissingDocs.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded" onClick={() => navigate(`/pilgrims/${p.id}`)}>
              <div>
                <p className="text-sm font-medium">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">{p.registration_no}</p>
              </div>
              <p className="text-xs text-destructive font-semibold">Upload Needed</p>
            </div>
          )) : <p className="text-sm text-muted-foreground">All pilgrims have at least one document.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-primary" /><h3 className="font-bold text-sm">Leads Pipeline</h3></div>
          <p className="text-2xl font-bold">{leadStats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total leads • {leadStats.converted} converted</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate("/leads")}>Open Leads</Button>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Scheduled Follow-ups</p>
          <p className="text-2xl font-bold mt-2">{leadStats.followUps}</p>
          <p className="text-xs text-muted-foreground mt-1">Keep engagement active with timely callbacks.</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="text-2xl font-bold mt-2">{leadStats.total ? `${Math.round((leadStats.converted / leadStats.total) * 100)}%` : "0%"}</p>
          <p className="text-xs text-muted-foreground mt-1">Higher conversion improves package occupancy planning.</p>
        </div>
      </div>

      {/* Bottom Row: Chart + Recent Payments + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border p-5"
        >
          <h3 className="font-bold font-heading text-sm mb-4">Status Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#888"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[s.name] }}
                />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Payments */}
        {hasPermission("accounts.view") && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-heading text-sm">Recent Payments</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/payments")} className="text-xs gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded"
                  onClick={() => navigate(`/pilgrims/${p.pilgrim_id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{p.pilgrim?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{p.payment_date} • {p.payment_mode}</p>
                  </div>
                  <p className="text-sm font-bold text-success">{formatCurrency(p.amount)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending Balance Alerts */}
        {hasPermission("accounts.view") && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-xl border p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h3 className="font-bold font-heading text-sm">Pending Balances</h3>
            </div>
            <div className="space-y-3">
              {pendingPilgrims.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded"
                  onClick={() => navigate(`/pilgrims/${p.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{p.registration_no}</p>
                  </div>
                  <p className="text-sm font-bold text-warning">{formatCurrency(p.balance)}</p>
                </div>
              ))}
              {pendingPilgrims.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">All accounts settled!</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
