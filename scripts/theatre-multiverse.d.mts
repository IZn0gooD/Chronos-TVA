import type { TheatreState } from "./theatre-state.mjs";
export const SHEET: string;
export const LENGTH: number;
export const SPEC: Record<string, Record<string, Array<[number, number] | [number, number, [number, number, number, number]]>>>;
export function buildMultiverseState(): TheatreState;
export function finalPose(): Record<string, Record<string, number>>;
