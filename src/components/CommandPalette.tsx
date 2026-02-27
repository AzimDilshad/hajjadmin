import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Search,
  LogOut,
  UserPlus,
  Keyboard,
} from "lucide-react";
import { PILGRIMS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pilgrims, pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          {hasPermission("pilgrims.view") && (
            <CommandItem onSelect={() => go("/pilgrims")}>
              <Users className="mr-2 h-4 w-4" />
              Pilgrims
            </CommandItem>
          )}
          <CommandItem onSelect={() => go("/packages")}>
            <Package className="mr-2 h-4 w-4" />
            Packages
          </CommandItem>
          {hasPermission("accounts.view") && (
            <CommandItem onSelect={() => go("/payments")}>
              <CreditCard className="mr-2 h-4 w-4" />
              Payments
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Pilgrims">
          {PILGRIMS.slice(0, 10).map((p) => (
            <CommandItem key={p.id} onSelect={() => go(`/pilgrims/${p.id}`)}>
              <Search className="mr-2 h-4 w-4" />
              <span>{p.full_name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.registration_no}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {hasPermission("pilgrims.add") && (
            <CommandItem onSelect={() => go("/pilgrims?action=add")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Pilgrim
            </CommandItem>
          )}
          <CommandItem
            onSelect={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
