import { NavLink } from "react-router-dom";
import {
  Activity,
  Crosshair,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  LayoutTemplate,
  Radio,
  ScrollText,
  Settings,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

type NavItemConfig = {
  label: string;
  to: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItemConfig[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Stub Mappings", to: "/mappings", icon: Webhook },
  { label: "Templates", to: "/templates", icon: LayoutTemplate },
  { label: "Requests", to: "/requests", icon: Activity },
  { label: "Near Misses", to: "/near-misses", icon: Crosshair },
  { label: "Scenarios", to: "/scenarios", icon: GitBranch },
  { label: "Recording", to: "/recording", icon: Radio },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Files", to: "/files", icon: FolderOpen },
  { label: "Logs", to: "/logs", icon: ScrollText },
];

/** Fixed left navigation sidebar, active item derived from the current route. */
export function AppSidebar() {
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r bg-background p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-secondary text-secondary-foreground"
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
