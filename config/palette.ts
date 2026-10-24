/**
 * The TVA palette as data, for everything that cannot read CSS: canvas pieces,
 * GLSL uniforms, generated SVG. styles/tokens.css declares the same eight
 * swatches as `--tva-*` custom properties; tests/palette.test.ts fails if the
 * two drift apart. At runtime `readPalette()` prefers the live CSS values, so
 * a theme that only edits tokens.css still reaches the GPU.
 */
export const palette = {
  sage: "#959a83",
  orange: "#d6720c",
  olive: "#6f6318",
  teal: "#5f7a6e",
  green: "#29584f",
  obsidian: "#171914",
  paper: "#d9d3c5",
  warm: "#f2ebdd",
} as const;

export type PaletteKey = keyof typeof palette;
export type Palette = Record<PaletteKey, string>;

/** Derived tints used where a swatch alone would not read (see tokens.css for the ratios). */
export const tints = {
  /** Small teal text on obsidian (5.8:1). */
  temporalText: "#7d9a8c",
  /** Sage, 7 % darker: the quietest text that still meets AA on obsidian (5.2:1) and on the panels (4.7:1). */
  subtle: "#888d78",
  /** Burnt orange: the only orange that reads as small text on Archive Paper (4.75:1). */
  orangeOnPaper: "#8a4605",
} as const;

const CSS_NAMES: Record<PaletteKey, string> = {
  sage: "--tva-sage",
  orange: "--tva-orange",
  olive: "--tva-olive",
  teal: "--tva-teal",
  green: "--tva-green",
  obsidian: "--tva-obsidian",
  paper: "--tva-paper",
  warm: "--tva-warm",
};

/**
 * The palette in force on the page: the `--tva-*` custom properties when a
 * document exists, the constants otherwise (server, tests, Node scripts).
 */
export function readPalette(root?: Element | null): Palette {
  if (typeof window === "undefined" || typeof getComputedStyle !== "function") return { ...palette };
  const style = getComputedStyle(root ?? document.documentElement);
  const out = { ...palette } as Palette;
  for (const key of Object.keys(CSS_NAMES) as PaletteKey[]) {
    const value = style.getPropertyValue(CSS_NAMES[key]).trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) out[key] = value.toLowerCase();
  }
  return out;
}

/** sRGB hex to linear RGB components in 0..1, for GLSL uniforms (three.js expects linear colours). */
export function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [channel((n >> 16) & 255), channel((n >> 8) & 255), channel(n & 255)];
}

/** Relative luminance (WCAG 2.x) of a hex colour. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToLinear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, 1..21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
