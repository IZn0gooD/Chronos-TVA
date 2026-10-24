"use client";

import { StatusIndicator, type Status } from "@/components/ui/status-indicator";
import { siteConfig } from "@/config/site";
import { useScene } from "@/lib/signals";
import type { BranchState } from "@/types/content";

const BY_STATE: Record<BranchState, { status: Status; label: string }> = {
  sacred: { status: "nominal", label: "Nominal" },
  contained: { status: "watch", label: "Branch contained" },
  pruned: { status: "offline", label: "Branch pruned" },
  nexus: { status: "anomaly", label: "Nexus under review" },
};

/** The header's status: it follows the branch selected in the explorer, so the chrome reflects the desk's current state. */
export function SystemStatus() {
  const state = useScene((s) => s.branchState);
  const id = useScene((s) => s.branchId);
  const { status, label } = BY_STATE[state];
  return <StatusIndicator status={status} label={label} detail={id ?? siteConfig.systemId} />;
}
