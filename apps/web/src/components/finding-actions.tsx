"use client";

import { MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptFinding, mitigateFinding } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FindingActions({ findingId }: { findingId: string }) {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ["findings"] });

  const accept = useMutation({ mutationFn: () => acceptFinding(findingId), onSuccess });
  const mitigate = useMutation({ mutationFn: () => mitigateFinding(findingId), onSuccess });
  const busy = accept.isPending || mitigate.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => accept.mutate()}>Accept risk</DropdownMenuItem>
        <DropdownMenuItem onClick={() => mitigate.mutate()}>Mark mitigated</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
