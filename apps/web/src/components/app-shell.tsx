import { Bell } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <span className="size-6 rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500" />
          <span className="text-lg font-semibold tracking-tight">Bornite</span>
        </div>

        <SidebarNav />

        <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border p-3">
          <button
            type="button"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Bell className="size-4" />
            <span>Notifications</span>
            <span className="ml-auto rounded-full bg-primary/20 px-1.5 text-xs font-medium text-primary-foreground/90">
              3
            </span>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-sidebar-accent/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
              FA
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">François Allais</span>
              <span className="block truncate text-xs text-sidebar-foreground/60">Security</span>
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
