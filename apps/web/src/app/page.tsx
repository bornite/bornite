import { cn } from "@/lib/utils";
import { findings } from "@/lib/findings";
import { FindingsTable } from "@/components/findings-table";

const active = findings.filter(
  (f) => f.status === "OPEN" || f.status === "CONFIRMED",
);
const avgRisk = active.length
  ? Math.round(active.reduce((sum, f) => sum + f.riskScore, 0) / active.length)
  : 0;

const STATS: Array<{ label: string; value: number; hint: string; accent?: string }> = [
  { label: "Open findings", value: active.length, hint: `${findings.length} total` },
  {
    label: "Critical (active)",
    value: active.filter((f) => f.severity === "CRITICAL").length,
    hint: "needs attention",
    accent: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Known exploited",
    value: findings.filter((f) => f.knownExploited).length,
    hint: "in CISA KEV",
    accent: "text-orange-600 dark:text-orange-400",
  },
  { label: "Avg risk score", value: avgRisk, hint: "of active findings" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your vulnerabilities, prioritized by real risk.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn("text-3xl font-semibold tabular-nums", s.accent)}>
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Prioritized worklist
        </h2>
        <FindingsTable />
      </div>
    </div>
  );
}
