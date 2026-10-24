import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrast, palette, tints } from "@/config/palette";

const tokens = readFileSync(path.resolve(process.cwd(), "styles/tokens.css"), "utf8").toLowerCase();
const base = readFileSync(path.resolve(process.cwd(), "styles/base.css"), "utf8");

/*
 * The contrast strategy, as a test. Every pair below is a real combination
 * on the page; the ratios are WCAG 2.2 (4.5 for text, 3 for graphics and
 * controls). Change a swatch and this tells you what stopped reading.
 */
describe("palette", () => {
  it("mirrors every swatch into tokens.css", () => {
    for (const [key, hex] of Object.entries(palette)) expect(tokens).toContain(`--tva-${key}: ${hex}`);
  });

  it("text on obsidian meets AA", () => {
    for (const hex of [palette.warm, palette.paper, palette.sage, tints.subtle, palette.orange, tints.temporalText]) {
      expect(contrast(hex, palette.obsidian), hex).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the quietest text still reads on the raised panels", () => {
    expect(contrast(tints.subtle, "#21221d")).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.sage, "#272822")).toBeGreaterThanOrEqual(4.5);
  });

  it("temporal graphics on obsidian meet 3:1", () => {
    expect(contrast(palette.teal, palette.obsidian)).toBeGreaterThanOrEqual(3);
  });

  it("filled surfaces read with their ink", () => {
    expect(contrast(palette.obsidian, palette.orange)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.obsidian, palette.sage)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.obsidian, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.warm, palette.olive)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.warm, palette.green)).toBeGreaterThanOrEqual(4.5);
  });

  it("the paper sheet prints its inks", () => {
    expect(contrast(tints.orangeOnPaper, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.green, palette.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#524b3e", "#c8c2b3")).toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette.olive, palette.paper)).toBeGreaterThanOrEqual(3);
  });

  it("the green plate keeps its text and marks readable", () => {
    expect(contrast(palette.paper, palette.green)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#bfcabb", palette.green)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#b4d0c5", palette.green)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#f6b885", palette.green)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#e8863a", palette.green)).toBeGreaterThanOrEqual(3);
    expect(contrast(palette.paper, "#30635a")).toBeGreaterThanOrEqual(4.5);
  });

  it("declares the re-themed surfaces", () => {
    expect(base).toContain(".surface-paper");
    expect(base).toContain(".surface-green");
  });
});
