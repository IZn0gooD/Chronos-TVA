import type { BootLine } from "@/types/content";

/**
 * The boot sequence: a few diagnostic lines, then the system is up. The
 * whole thing plays in about two seconds; the overlay dismisses itself at
 * the last line and can be skipped at any moment.
 */
export const bootLines: readonly BootLine[] = [
  { text: "CHRONOS terminal  ·  build 1962.44", at: 0 },
  { text: "Loading temporal registry", at: 0.25, tone: "ok" },
  { text: "Calibrating sacred timeline", at: 0.55, tone: "ok" },
  { text: "Variance threshold set to 0.31 σ", at: 0.85 },
  { text: "Pruning authority", at: 1.1, tone: "warn" },
  { text: "Anomaly watch", at: 1.35, tone: "ok" },
  { text: "All timelines nominal.", at: 1.7 },
];

/** Seconds from the first line to the overlay's exit. */
export const BOOT_DURATION = 2.2;
