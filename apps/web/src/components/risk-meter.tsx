import { cn } from "@/lib/utils";
import { riskBand, type RiskBand } from "@/lib/findings";

const BAR: Record<RiskBand, string> = {
  CRITICAL: "bg-rose-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-sky-500",
  MINIMAL: "bg-zinc-400",
};

export function RiskMeter({ score }: { score: number }) {
  const band = riskBand(score);
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", BAR[band])}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-6 text-right text-sm font-semibold tabular-nums">
        {score}
      </span>
    </div>
  );
}
