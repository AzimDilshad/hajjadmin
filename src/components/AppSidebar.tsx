import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  LogOut,
  Plane,
  UserCog,
  Keyboard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: null },
  { title: "Pilgrims", url: "/pilgrims", icon: Users, permission: "pilgrims.view" },
  { title: "Packages", url: "/packages", icon: Package, permission: null },
  { title: "Payments", url: "/payments", icon: CreditCard, permission: "accounts.view" },
  { title: "Users", url: "/users", icon: UserCog, permission: "users.manage" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout, hasPermission } = useAuth();

  const filteredItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-3 px-3 py-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img src={logo} alt="Goodhope Enterprises" className="h-10 w-auto" />
              </div>
            )}
            {collapsed && (
              <Plane className="h-6 w-6 text-sidebar-primary mx-auto" />
            )}
          </div>

          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
          </div>
        )}
        <SidebarMenu>
          {!collapsed && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }))}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Shortcuts</span>
                <kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-sidebar-accent rounded border border-sidebar-border font-mono">?</kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="hover:bg-destructive/20 text-sidebar-foreground/70 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
