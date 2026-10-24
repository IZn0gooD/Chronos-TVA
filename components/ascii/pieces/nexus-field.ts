/**
 * nexus-field: a temporal anomaly, as a TVA terminal would plot it.
 *
 * A singularity pulls the Sacred Timeline into a slow lens; now and then a
 * branch tears off it, flickers, and is pruned back. Everything is a pure
 * function of time, so the piece loops exactly, holds a chosen still frame
 * for readers without motion, and renders the same on the server.
 *
 * Built with ascii.rest/kit: piece() for the grid, drawField() for the lens;
 * the timeline is plotted cell by cell as a box-drawn staircase. Colours come from the TVA palette; orange
 * appears only while a branch exists.
 */
import { TAU, clamp, drawField, hash, line, piece, random, smoothstep } from "ascii.rest/kit";
import { palette, tints } from "@/config/palette";

/** Palette indices, named so the drawing reads. */
const INK = 0; // quiet sage-grey ink for the lens
const STAR = 1; // dim field stars
const SAGE = 2;
const PAPER = 3;
const GOLD = 4;
const GOLD_DIM = 5;
const ORANGE = 6;
const ORANGE_HOT = 7;

/** Two derived greys for the stars, then the palette: sage, paper, the teal text tint and a dim teal, orange and a hot orange. */
const PALETTE = ["#6f7560", "#454840", palette.sage, palette.paper, tints.temporalText, "#4f6a5e", palette.orange, "#e8863a"];

/** One loop of the scene, in seconds. Two branch events live inside it. */
const LOOP = 14;

interface BranchEvent {
  /** Seconds into the loop when the branch starts to grow. */
  start: number;
  /** Column where it leaves the timeline, as a share of the width. */
  origin: number;
  /** Direction: +1 grows down-right, -1 grows up-left. */
  dir: 1 | -1;
  /** Full length, as a share of the width. */
  length: number;
}

const EVENTS: readonly BranchEvent[] = [
  { start: 2.2, origin: 0.64, dir: 1, length: 0.19 },
  { start: 8.6, origin: 0.33, dir: -1, length: 0.155 },
];

/** Growth 0→1, a flickering hold, then pruning 1→0, over 4.4 seconds. */
function branchPhase(local: number): { extent: number; glitch: boolean } {
  if (local < 0 || local > 4.4) return { extent: 0, glitch: false };
  if (local < 1.1) return { extent: smoothstep(0, 1.1, local), glitch: false };
  if (local < 3.3) return { extent: 1, glitch: true };
  return { extent: 1 - smoothstep(3.3, 4.4, local), glitch: false };
}

export interface NexusFieldOptions {
  /** How far the lens bends the timeline, in rows. */
  lens: number;
  [key: string]: unknown;
}

/**
 * Makes the piece at a size. The hero uses 60×22 beside the title; narrow
 * screens 44×15 as a band, so glyphs stay legible when the canvas shrinks.
 */
export function nexusField(cols: number, rows: number) {
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const stars = (() => {
    const rnd = random(1961);
    return Array.from({ length: Math.round(cols * rows * 0.018) }, () => ({
      x: rnd.int(0, cols - 1),
      y: rnd.int(0, rows - 1),
      phase: rnd() * TAU,
      bright: rnd() > 0.8,
    }));
  })();

  /** The timeline's row at a column: a slow S-wobble where the lens pulls it. */
  const timelineY = (x: number, t: number, lens: number) => {
    const d = (x - cx) / (cols * 0.14);
    const breathe = 1 + 0.12 * Math.sin((TAU * t) / LOOP);
    return cy + lens * breathe * Math.sin(d * 1.4) * Math.exp(-d * d * 0.55);
  };

  return piece<NexusFieldOptions>(
    {
      name: "nexus field",
      note: "a singularity bends the timeline; branches tear off and are pruned",
      category: "space",
      cols,
      rows,
      fps: 20,
      loop: LOOP,
      still: 4.2,
      palette: PALETTE,
      ink: INK,
      options: { lens: 1.8 },
    },
    (t, s, ctx) => {
      const phase = (t % LOOP) / LOOP;
      const lens = typeof ctx.options.lens === "number" ? ctx.options.lens : 1.8;

      // 1. Field stars: a few twinkle, most hold.
      for (const star of stars) {
        // Four twinkles per loop, so the piece repeats exactly every LOOP seconds.
        const tw = Math.sin((TAU * 4 * t) / LOOP + star.phase);
        if (tw < -0.55) continue;
        s.set(star.x, star.y, star.bright && tw > 0.6 ? "+" : "·", star.bright ? SAGE : STAR);
      }

      // 2. The singularity: rings flowing inward, fading with distance, a void at the core.
      drawField(
        s,
        (x, y, _t, at) => {
          const r = at.r;
          if (r < 0.1) return null;
          const swirl = 0.35 * Math.sin(at.a * 3 - TAU * phase);
          const rings = 0.5 + 0.5 * Math.cos(r * 13 + swirl - TAU * phase * 2);
          const fall = Math.exp(-r * 2.4);
          const v = rings * fall;
          return v < 0.1 ? null : v;
        },
        t,
        { ramp: " ·:-=+*#", colors: ["#3a3d34", "#6f7560", palette.sage, palette.paper], steps: 12, invert: false, gamma: 0.9, dither: true },
      );

      // 3. The Sacred Timeline, bent by the lens, in teal: a plotted staircase
      // with box corners where it steps, so the refraction reads as a curve.
      const points: [number, number][] = [];
      for (let x = 0; x < cols; x++) points.push([x, Math.round(timelineY(x, t, lens))]);
      s.set(0, points[0][1], "─", GOLD);
      for (let x = 1; x < cols; x++) {
        const y0 = points[x - 1][1];
        const y1 = points[x][1];
        if (y1 === y0) {
          s.set(x, y1, "─", GOLD);
          continue;
        }
        const down = y1 > y0;
        s.set(x, y0, down ? "╮" : "╯", GOLD);
        for (let r = Math.min(y0, y1) + 1; r < Math.max(y0, y1); r++) s.set(x, r, "│", GOLD);
        s.set(x, y1, down ? "╰" : "╭", GOLD);
      }
      // Its two ends fade into the margins.
      for (let i = 0; i < 4; i++) {
        s.set(i, points[i][1], i % 2 ? "─" : "·", GOLD_DIM);
        s.set(cols - 1 - i, points[cols - 1 - i][1], i % 2 ? "─" : "·", GOLD_DIM);
      }
      // Event markers along the line: small ticks every 12 columns, dimmed.
      for (let x = 6; x < cols - 6; x += 12) {
        if (Math.abs(x - cx) < 10) continue;
        s.set(x, points[x][1] + 1, "╵", GOLD_DIM);
      }

      // 4. Branch events: grow, flicker, prune. The only orange in the scene.
      for (const ev of EVENTS) {
        const local = ((t - ev.start) % LOOP + LOOP) % LOOP;
        const { extent, glitch } = branchPhase(local);
        if (extent <= 0) continue;
        const x0 = Math.round(ev.origin * cols);
        const y0 = points[clamp(x0, 0, cols - 1)][1];
        const len = Math.max(1, Math.round(ev.length * cols * extent));
        const x1 = x0 + ev.dir * len;
        const y1 = y0 + ev.dir * Math.round(len * 0.5);
        line(s, x0, y0, x1, y1, { char: "auto", color: ORANGE });
        s.set(x0, y0, "┼", GOLD);
        s.set(x1, y1, glitch ? "◆" : "·", ORANGE_HOT);
        if (glitch) {
          // A few cells along the branch break up each tick, deterministically.
          const tick = Math.floor(t * 10);
          for (let i = 1; i < len; i++) {
            const n = hash(i, tick, ev.dir + 2);
            if (n > 0.78) {
              const gx = x0 + ev.dir * i;
              const gy = y0 + ev.dir * Math.round(i * 0.5);
              s.set(gx, gy, "▒░#"[Math.floor(n * 17) % 3], n > 0.92 ? ORANGE_HOT : ORANGE);
            }
          }
        }
      }

      // 5. A slow raster beam: one row brightened every 7 seconds.
      const beam = Math.floor(((t / 7) % 1) * rows);
      for (let x = 0; x < cols; x++) {
        const ch = s.get(x, beam);
        if (ch && ch !== " " && s.colorAt(x, beam) <= STAR) s.set(x, beam, ch, PAPER);
      }
    },
  );
}

export const nexusFieldWide = nexusField(60, 22);
export const nexusFieldNarrow = nexusField(44, 15);
