import type { Frame, Meta } from "ascii.rest";

/**
 * typed-line: one or more lines typed in at a steady pace, then held with a
 * blinking cursor. A plain piece (meta + frame function), deliberately
 * written without ascii.rest/kit so the routes that only need a typed line
 * do not pay for the kit's widgets.
 */
export interface TypedLineOptions {
  /** Characters per second. */
  speed?: number;
  /** Seconds before the first character. */
  delay?: number;
}

export function typedLine(lines: readonly string[], { speed = 32, delay = 0 }: TypedLineOptions = {}) {
  const cols = Math.max(...lines.map((l) => l.length)) + 1;
  const rows = lines.length;
  const total = lines.reduce((n, l) => n + l.length, 0);
  const typingSeconds = total / speed;
  const meta = {
    name: "typed line",
    category: "type",
    note: "text typed in, then held with a blinking cursor",
    cols,
    rows,
    fps: 12,
    // The still frame, for reduced motion, shows every letter.
    still: delay + typingSeconds + 1,
  } satisfies Meta;

  const make = (): Frame => (t) => {
    const typed = Math.max(0, Math.floor((t - delay) * speed));
    let budget = typed;
    const cursorOn = Math.floor(t * 2) % 2 === 0;
    const done = typed >= total;
    return lines
      .map((line, i) => {
        const shown = Math.max(0, Math.min(line.length, budget));
        budget -= line.length;
        const isLast = i === rows - 1;
        const cursorHere = done ? isLast : shown < line.length;
        const cursor = cursorHere && (done ? cursorOn : true) ? "▌" : " ";
        return (line.slice(0, shown) + cursor).padEnd(cols);
      })
      .join("\n");
  };

  return { meta, default: make };
}
