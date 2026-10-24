/**
 * The shared interaction signals: the small, typed state that lets the
 * interface and the graphics behave as one system.
 *
 * Two tiers, on purpose:
 * - `scene` is low-frequency React state (selected branch, consulted file,
 *   temporal events, effects level). Components subscribe with
 *   `useScene(selector)`; the graphics read it in their render loop.
 * - `frame` is high-frequency and mutable (pointer, scroll progress). It is
 *   written by listeners and read inside `useFrame`; it never passes through
 *   React, so a pointer move never re-renders anything.
 */
import { useSyncExternalStore } from "react";
import type { BranchState } from "@/types/content";

export type EffectsLevel = "full" | "reduced" | "off";

export interface SceneState {
  /** Identifier of the branch under review in the explorer; null = the sacred timeline alone. */
  branchId: string | null;
  branchState: BranchState;
  /** 0 = the sacred timeline; 1.. = the n-th branch on record. Drives the orbital that lights up. */
  branchIndex: number;
  /** The last registry file opened, if any. */
  variantId: string | null;
  /** Files opened this session, for the final readout. */
  filesConsulted: number;
  /** Temporal events triggered this session; each increment plays the choreography once. */
  events: number;
  /** performance.now() of the last event, for envelopes computed in the render loop. */
  eventAt: number;
  effects: EffectsLevel;
}

const initial: SceneState = {
  branchId: null,
  branchState: "sacred",
  branchIndex: 0,
  variantId: null,
  filesConsulted: 0,
  events: 0,
  eventAt: -Infinity,
  effects: "full",
};

let state: SceneState = initial;
const listeners = new Set<() => void>();

export const scene = {
  get: () => state,
  set(patch: Partial<SceneState> | ((s: SceneState) => Partial<SceneState>)) {
    const next = typeof patch === "function" ? patch(state) : patch;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Tests and stories start from a clean desk. */
  reset() {
    state = initial;
    listeners.forEach((l) => l());
  },
};

/** Subscribe a component to one slice of the scene state. */
export function useScene<T>(selector: (s: SceneState) => T): T {
  return useSyncExternalStore(scene.subscribe, () => selector(state), () => selector(initial));
}

/** A variance on the sacred line: the hero, the chamber, the field and the readout all answer it. */
export function triggerTemporalEvent(now: number = typeof performance !== "undefined" ? performance.now() : 0) {
  scene.set((s) => ({ events: s.events + 1, eventAt: now }));
}

export function selectBranch(branchId: string | null, branchState: BranchState, branchIndex: number) {
  scene.set({ branchId, branchState, branchIndex });
}

export function consultFile(variantId: string | null) {
  scene.set((s) => ({ variantId, filesConsulted: variantId ? s.filesConsulted + 1 : s.filesConsulted }));
}

/** High-frequency values. Normalised: pointer in -1..1 from the viewport centre, progress in 0..1. */
export const frame = {
  pointer: { x: 0, y: 0 },
  /** How far the hero has scrolled out of view. */
  hero: 0,
  /** Scroll position through the whole document. */
  page: 0,
};

/** Smoothly moves `current` toward `target`; the classic frame-rate-independent lerp. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
