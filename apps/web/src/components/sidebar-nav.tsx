"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bug,
  FileText,
  LayoutDashboard,
  Radar,
  Server,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Findings", icon: ShieldAlert, href: "#" },
  { label: "Assets", icon: Server, href: "#" },
  { label: "Vulnerabilities", icon: Bug, href: "#" },
  { label: "Connectors", icon: Radar, href: "/connectors" },
  { label: "Reports", icon: FileText, href: "#" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : item.href !== "#" && pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
