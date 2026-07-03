import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/findings";

const STYLES: Record<Severity, string> = {
  CRITICAL: "bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-400",
  HIGH: "bg-orange-500/15 text-orange-600 ring-orange-500/30 dark:text-orange-400",
  MEDIUM: "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-400",
  LOW: "bg-sky-500/15 text-sky-600 ring-sky-500/30 dark:text-sky-400",
  INFO: "bg-zinc-500/15 text-zinc-600 ring-zinc-500/30 dark:text-zinc-400",
};

const LABELS: Record<Severity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  INFO: "Info",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[severity],
      )}
    >
      {LABELS[severity]}
    </span>
  );
}
