/** Shared editorial types. The data files in data/ satisfy these shapes. */

export type VariantStatus = "monitored" | "pruned" | "contained" | "escalated";
/** The single source for categories: data, filters and the report form all read it. */
export const VARIANT_CATEGORIES = ["temporal", "biological", "technological", "administrative"] as const;
export type VariantCategory = (typeof VARIANT_CATEGORIES)[number];
export type VariantFigure = "diagram" | "typographic" | "ascii" | "geometric" | "field";
/** Pieces a registry file may name as its ascii figure (see components/chronos/variant-registry/figure-ascii.tsx). */
export type VariantArt = "fern" | "interference";
/** Shader presets a registry file may name as its field figure (see components/chronos/variant-registry/figure-field.tsx). */
export type VariantField = "reactor" | "shadow";

export interface Variant {
  /** Stable identifier printed on the card, e.g. "VR-0427". */
  id: string;
  name: string;
  status: VariantStatus;
  category: VariantCategory;
  /** One sentence, read on the card. */
  summary: string;
  /** Longer note, read in the detail dialog. */
  detail: string;
  /** Which figure component draws the card's illustration. */
  figure: VariantFigure;
  /** For `figure: "ascii"`: which registered piece draws the card. */
  art?: VariantArt;
  /** For `figure: "field"`: which shader preset draws the card (an SVG plate stands in without WebGL). */
  field?: VariantField;
  /** Fictional file metadata shown as administrative microtype. */
  meta: { sector: string; opened: string; analyst: string };
}

export type BranchState = "sacred" | "nexus" | "pruned" | "contained";

export interface Branch {
  id: string;
  label: string;
  state: BranchState;
  /** Where the branch leaves the sacred timeline, 0..1 along its length. */
  origin: number;
  /** Vertical offset of the branch end, in diagram units: positive is down. */
  drift: number;
  /** Fictional divergence index shown in the panel; clearly labelled as such. */
  divergence: string;
  summary: string;
  events: ReadonlyArray<{ at: string; note: string }>;
}

export interface Directive {
  /** Administrative article number, e.g. "01". */
  article: string;
  title: string;
  statement: string;
  /** Which geometric plate illustrates the directive. */
  plate: "circle" | "bars" | "branch" | "grid" | "hourglass" | "eye";
}

export interface BootLine {
  text: string;
  /** Seconds after the sequence starts. */
  at: number;
  tone?: "default" | "ok" | "warn";
}
