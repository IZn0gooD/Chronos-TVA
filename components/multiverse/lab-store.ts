"use client";

import { useSyncExternalStore } from "react";

/*
 * What the HUD shows. Written by the engine at 4 Hz from the render loop
 * (never per frame), read by React through useSyncExternalStore. Commands
 * go the other way, as plain method calls on the engine.
 */

export interface SelectionInfo {
  id: number;
  name: string;
  kind: "fabric" | "root" | "branch" | "weave";
  parent: string | null;
  depth: number;
  born: number;
  age: number;
  energy: number;
  stability: number;
  children: number;
  descendants: number;
  state: "growing" | "stable" | "unstable" | "dissolving";
  weave: string | null;
  canParent: boolean;
  canChild: boolean;
  canSibling: boolean;
  canBranch: boolean;
  canPrune: boolean;
}

export interface FeedLine {
  key: string;
  time: string;
  text: string;
  tone: "birth" | "weave" | "collapse" | "pulse" | "era";
}

export interface LabSnapshot {
  status: "initialising" | "live" | "static";
  staticReason: string;
  mode: "cinematic" | "explore";
  playing: boolean;
  /** True while frames must keep coming (cinematic playing or the network living). */
  animating: boolean;
  simTime: number;
  phase: string;
  phaseNote: string;
  cinematicProgress: number;
  live: number;
  born: number;
  pruned: number;
  woven: number;
  pulses: number;
  capacity: number;
  fps: number;
  frameMs: number;
  calls: number;
  triangles: number;
  level: 0 | 1 | 2;
  pinned: boolean;
  dpr: number;
  particles: number;
  bloom: boolean;
  selection: SelectionInfo | null;
  feed: FeedLine[];
  expansionRate: number;
  density: number;
  studio: boolean;
  reduced: boolean;
  /** Index of the era in force after the cinematic, null during it. */
  era: number | null;
  autopilot: boolean;
  /** What the autopilot is looking at, in words. */
  shot: string;
}

export const initialSnapshot: LabSnapshot = {
  status: "initialising",
  staticReason: "",
  mode: "cinematic",
  playing: false,
  animating: false,
  simTime: 0,
  phase: "Awakening",
  phaseNote: "",
  cinematicProgress: 0,
  live: 0,
  born: 0,
  pruned: 0,
  woven: 0,
  pulses: 0,
  capacity: 0,
  fps: 0,
  frameMs: 0,
  calls: 0,
  triangles: 0,
  level: 0,
  pinned: false,
  dpr: 1,
  particles: 0,
  bloom: true,
  selection: null,
  feed: [],
  expansionRate: 1,
  density: 1,
  studio: false,
  reduced: false,
  era: null,
  autopilot: true,
  shot: "",
};

export function createLabStore() {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();
  return {
    get: () => snapshot,
    set(patch: Partial<LabSnapshot>) {
      snapshot = { ...snapshot, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type LabStore = ReturnType<typeof createLabStore>;

export function useLab(store: LabStore): LabSnapshot {
  return useSyncExternalStore(store.subscribe, store.get, () => initialSnapshot);
}
