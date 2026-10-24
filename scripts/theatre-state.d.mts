/** Types for scripts/theatre-state.mjs, so tests can import the generator. */
export interface Keyframe {
  id: string;
  position: number;
  connectedRight: boolean;
  handles: [number, number, number, number];
  type: "bezier";
  value: number;
}
export interface Track {
  type: "BasicKeyframedTrack";
  __debugName: string;
  keyframes: Keyframe[];
}
export interface ObjectTracks {
  trackData: Record<string, Track>;
  trackIdByPropPath: Record<string, string>;
}
export interface TheatreState {
  sheetsById: Record<
    string,
    {
      staticOverrides: { byObject: Record<string, unknown> };
      sequence: { subUnitsPerUnit: number; length: number; type: "PositionalSequence"; tracksByObject: Record<string, ObjectTracks> };
    }
  >;
  definitionVersion: string;
  revisionHistory: string[];
}
export const SHEET: string;
export const RANGES: { entrance: [number, number]; event: [number, number] };
export function restingPose(): Record<string, Record<string, number>>;
export function buildState(): TheatreState;
export function stateFrom(options: { sheet: string; spec: Record<string, Record<string, unknown[]>>; length: number; revision: string }): TheatreState;
export function poseAt(spec: Record<string, Record<string, unknown[]>>, position: number): Record<string, Record<string, number>>;
