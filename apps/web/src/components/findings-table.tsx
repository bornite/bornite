"use client";

import { useMemo, useState } from "react";
import { Flame, Search } from "lucide-react";
import type { Finding, Severity } from "@/lib/findings";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { RiskMeter } from "@/components/risk-meter";
import { FindingActions } from "@/components/finding-actions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SEVERITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All severities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export function FindingsTable({
  findings,
  loading,
}: {
  findings: Finding[];
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return findings
      .filter((f) => severity === "ALL" || f.severity === (severity as Severity))
      .filter((f) => {
        if (!q) return true;
        return [f.title, f.asset.name, f.vulnerability.cve ?? f.vulnerability.id, f.source]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [findings, query, severity]);

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search findings, assets, CVEs…"
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={severity} onValueChange={(v) => setSeverity(v ?? "ALL")}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {rows.length} findings
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[140px]">Risk</TableHead>
            <TableHead>Finding</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead className="hidden lg:table-cell">Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[48px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((f) => (
            <TableRow key={f.id} className="align-top">
              <TableCell className="py-3">
                <RiskMeter score={f.riskScore} />
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.title}</span>
                  <SeverityBadge severity={f.severity} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-mono">{f.vulnerability.cve ?? f.vulnerability.id}</span>
                  {f.cwe !== undefined && <span>· CWE-{f.cwe}</span>}
                  {f.epss !== undefined && <span>· EPSS {Math.round(f.epss * 100)}%</span>}
                  {f.knownExploited && (
                    <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 font-medium text-rose-600 dark:text-rose-400">
                      <Flame className="size-3" /> KEV
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="font-medium">{f.asset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {f.asset.type.replace(/_/g, " ").toLowerCase()}
                </div>
              </TableCell>
              <TableCell className="hidden py-3 text-sm text-muted-foreground lg:table-cell">
                {f.source}
              </TableCell>
              <TableCell className="py-3">
                <StatusBadge status={f.status} />
              </TableCell>
              <TableCell className="py-3 text-right">
                <FindingActions findingId={f.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.length === 0 && (
        <div className="p-10 text-center text-sm text-muted-foreground">
          {loading ? "Loading findings…" : "No findings match your filters."}
        </div>
      )}
    </div>
  );
}
