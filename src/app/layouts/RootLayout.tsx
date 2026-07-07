import { Outlet } from "react-router-dom";
import { AppHeader } from "@/widgets/app-header/ui/AppHeader";
import { AppSidebar } from "@/widgets/app-sidebar/ui/AppSidebar";

/** Application shell: header + sidebar + routed page content. */
export function RootLayout() {
  return (
    <div className="flex h-svh flex-col">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
