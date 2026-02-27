import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search } from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  useSessionTimeout();

  return (
    <SidebarProvider>
      <CommandPalette />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h2 className="text-sm font-medium text-muted-foreground font-heading hidden sm:block">
                Goodhope Enterprises — Admin Panel
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 hover:bg-muted text-muted-foreground text-xs transition-colors"
                onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search…</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-background rounded border font-mono">⌘K</kbd>
              </button>
              <button className="p-2 rounded-md hover:bg-muted transition-colors relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
