import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pilgrims from "./pages/Pilgrims";
import PilgrimProfile from "./pages/PilgrimProfile";
import PackagesPage from "./pages/PackagesPage";
import PaymentsPage from "./pages/PaymentsPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function GlobalShortcuts() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!user) return;
      if (e.ctrlKey && e.shiftKey && e.key === "D") { e.preventDefault(); navigate("/dashboard"); }
      if (e.ctrlKey && e.shiftKey && e.key === "U") { e.preventDefault(); navigate("/users"); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [navigate, user]);

  return null;
}

const AppRoutes = () => (
  <>
    <GlobalShortcuts />
    <KeyboardShortcutsDialog />
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pilgrims" element={<ProtectedRoute><Pilgrims /></ProtectedRoute>} />
      <Route path="/pilgrims/:id" element={<ProtectedRoute><PilgrimProfile /></ProtectedRoute>} />
      <Route path="/packages" element={<ProtectedRoute><PackagesPage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
