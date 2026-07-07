import { Webhook } from "lucide-react";
import { GlobalSearch } from "@/widgets/app-header/ui/GlobalSearch";
import { ServerStatusIndicator } from "@/widgets/app-header/ui/ServerStatusIndicator";
import { ThemeToggle } from "@/widgets/app-header/ui/ThemeToggle";

/** Fixed top header: logo, global search, server status, theme toggle. */
export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2 font-semibold">
        <Webhook className="size-5 text-primary" />
        <span>WireMock Dashboard</span>
      </div>

      <div className="flex flex-1 justify-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <ServerStatusIndicator />
        <ThemeToggle />
      </div>
    </header>
  );
}
