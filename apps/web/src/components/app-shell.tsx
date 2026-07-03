import Link from "next/link";
import {
  Bell,
  Bug,
  FileText,
  LayoutDashboard,
  Radar,
  Server,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", active: true },
  { label: "Findings", icon: ShieldAlert, href: "#" },
  { label: "Assets", icon: Server, href: "#" },
  { label: "Vulnerabilities", icon: Bug, href: "#" },
  { label: "Sources", icon: Radar, href: "#" },
  { label: "Reports", icon: FileText, href: "#" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b px-5">
          <span className="size-6 rounded-md bg-gradient-to-br from-violet-500 via-indigo-500 to-teal-400" />
          <span className="text-lg font-semibold tracking-tight">Bornite</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 text-xs text-muted-foreground">
          Bornite · early preview
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
          <span className="text-sm text-muted-foreground">Risk-based vulnerability management</span>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Notifications">
              <Bell className="size-4.5" />
            </button>
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white">
              FA
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
