"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { fetchConnectors, fetchSources, registerSource } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ConnectorsView() {
  const queryClient = useQueryClient();
  const connectors = useQuery({ queryKey: ["connectors"], queryFn: fetchConnectors });
  const sources = useQuery({ queryKey: ["sources"], queryFn: fetchSources });

  const [open, setOpen] = useState(false);
  const [connectorKey, setConnectorKey] = useState("");
  const [name, setName] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});

  const selected = useMemo(
    () => connectors.data?.find((c) => c.key === connectorKey) ?? null,
    [connectors.data, connectorKey],
  );

  const register = useMutation({
    mutationFn: () => registerSource({ connectorKey, name, config }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      setOpen(false);
    },
  });

  function openDialog() {
    setConnectorKey("");
    setName("");
    setConfig({});
    register.reset();
    setOpen(true);
  }

  const requiredFilled =
    selected?.configFields.every((f) => !f.required || (config[f.name] ?? "").trim() !== "") ?? false;
  const canSubmit = connectorKey !== "" && name.trim() !== "" && requiredFilled;
  const list = sources.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Connectors</h1>
          <p className="text-sm text-muted-foreground">
            Configure the scanners Bornite pulls findings from.
          </p>
        </div>
        <Button onClick={openDialog}>
          <Plus className="size-4" />
          Add connector
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No connectors configured yet. Click{" "}
          <span className="font-medium text-foreground">Add connector</span> to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{s.name}</span>
                <span
                  className={cn("size-2 shrink-0 rounded-full", s.enabled ? "bg-emerald-500" : "bg-zinc-500")}
                />
              </div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {s.connectorKey} · {s.sourceType}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add connector</DialogTitle>
            <DialogDescription>Pick a connector type and enter its credentials.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Connector</Label>
              <Select
                value={connectorKey}
                onValueChange={(v) => {
                  setConnectorKey(v ?? "");
                  setConfig({});
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a connector…" />
                </SelectTrigger>
                <SelectContent>
                  {(connectors.data ?? []).map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-name">Name</Label>
              <Input
                id="source-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production SCA"
              />
            </div>

            {selected?.configFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`cfg-${field.name}`}>
                  {field.label}
                  {field.required && <span className="text-rose-400"> *</span>}
                </Label>
                <Input
                  id={`cfg-${field.name}`}
                  type={field.type === "password" ? "password" : "text"}
                  placeholder={field.placeholder}
                  value={config[field.name] ?? ""}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                />
              </div>
            ))}

            {register.isError && (
              <p className="text-sm text-rose-400">Couldn&apos;t add the connector. Check the fields and try again.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || register.isPending} onClick={() => register.mutate()}>
              {register.isPending ? "Adding…" : "Add connector"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
