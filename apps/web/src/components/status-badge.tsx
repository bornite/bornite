import { cn } from "@/lib/utils";
import type { FindingStatus } from "@/lib/findings";

const CONFIG: Record<FindingStatus, { label: string; dot: string }> = {
  OPEN: { label: "Open", dot: "bg-emerald-500" },
  CONFIRMED: { label: "Confirmed", dot: "bg-blue-500" },
  RISK_ACCEPTED: { label: "Risk accepted", dot: "bg-violet-500" },
  MITIGATED: { label: "Mitigated", dot: "bg-zinc-400" },
  RESOLVED: { label: "Resolved", dot: "bg-zinc-400" },
  FALSE_POSITIVE: { label: "False positive", dot: "bg-zinc-300" },
};

export function StatusBadge({ status }: { status: FindingStatus }) {
  const { label, dot } = CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
