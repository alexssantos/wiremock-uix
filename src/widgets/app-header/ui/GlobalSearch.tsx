import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  LayoutTemplate,
  Radio,
  ScrollText,
  Settings,
  Webhook,
  Crosshair,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Stub Mappings", icon: Webhook, to: "/mappings" },
  { label: "New Stub Mapping", icon: Webhook, to: "/mappings/new" },
  { label: "Templates", icon: LayoutTemplate, to: "/templates" },
  { label: "New Template", icon: LayoutTemplate, to: "/templates/new" },
  { label: "Requests", icon: Activity, to: "/requests" },
  { label: "Near Misses", icon: Crosshair, to: "/near-misses" },
  { label: "Scenarios", icon: GitBranch, to: "/scenarios" },
  { label: "Recording", icon: Radio, to: "/recording" },
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Files", icon: FolderOpen, to: "/files" },
  { label: "Logs", icon: ScrollText, to: "/logs" },
];

/**
 * Global search / command palette (Cmd/Ctrl+K). v1 indexes static navigation
 * targets; indexing live stub mappings/requests is planned for v2 (see docs/12-roadmap.md).
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-56 items-center justify-between rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <span>Search...</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Global search" description="Jump to any page">
        <CommandInput placeholder="Search pages, stubs, requests..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.to}
                onSelect={() => {
                  navigate(item.to);
                  setOpen(false);
                }}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
