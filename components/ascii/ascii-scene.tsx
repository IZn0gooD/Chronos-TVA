"use client";

import { Ascii, type MountOptions, type Piece } from "ascii.rest/react";
import { useMemo, type CSSProperties } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/cn";
import { useMotionPaused } from "@/lib/motion-store";
import { ArtBoundary } from "./art-boundary";

interface AsciiSceneProps {
  /** A piece module (library, kit or your own). Names are not accepted here: pass modules so SSR can draw a still. */
  piece: Piece;
  /** The piece's own options, plus fps and motion. */
  options?: MountOptions;
  /** What the picture shows, for screen readers. Decorative scenes pass "" to be hidden. */
  label: string;
  /** Text pieces only: the font size the <pre> is drawn at. Default 12px. Use clamp() for fluid art. */
  size?: string;
  /** Colour of a text piece, as a CSS colour or token. The piece reads it to pick its shading. */
  color?: string;
  /** Draws a coloured piece (one with a palette) as text in the current colour, in a <pre>. */
  mono?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Width-to-height of a piece, so its box exists before anything draws. */
function pieceAspect(piece: Piece): string {
  const { cols, rows, cell = 2 } = piece.meta;
  return `${cols} / ${rows * cell}`;
}

/** The frame at the piece's still moment, for the server and for readers without motion. */
function stillFrame(piece: Piece, options: MountOptions | undefined, mono: boolean): string | null {
  if ((piece.meta.palette && !mono) || piece.meta.clock) return null;
  try {
    const own = { ...options };
    delete own.fps;
    delete own.motion;
    return piece.default(own)(piece.meta.still ?? 0);
  } catch (error) {
    console.warn("ascii still frame failed", piece.meta.name, error);
    return null;
  }
}

/**
 * ascii.rest piece with the three guarantees the layout needs:
 * - its space is reserved from the first paint (aspect ratio from meta),
 * - a text piece renders its still frame in the HTML, so the art is there
 *   before hydration and stays there if scripts never run,
 * - a piece that throws falls back to that still frame instead of a blank.
 * With the site's motion switch off, text pieces hold their still frame and
 * coloured pieces hold one frame.
 */
export function AsciiScene({ piece, options, label, size, color, mono = false, className, style }: AsciiSceneProps) {
  const live = useHydrated();
  const paused = useMotionPaused();

  const optionsKey = JSON.stringify(options ?? {});
  const still = useMemo(() => stillFrame(piece, options, mono), [piece, optionsKey, mono]); // eslint-disable-line react-hooks/exhaustive-deps -- options is compared by value through optionsKey
  const coloured = Boolean(piece.meta.palette) && !mono;
  const artStyle: CSSProperties = {
    ...(size ? ({ "--art-size": size } as CSSProperties) : {}),
    ...(color ? { color } : {}),
    ...(coloured ? { width: "100%", aspectRatio: pieceAspect(piece) } : {}),
    ...style,
  };
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };

  const fallback = still ? (
    <pre className={cn("art", className)} style={artStyle} {...a11y}>
      {still}
    </pre>
  ) : (
    <div className={cn("art", className)} style={artStyle} aria-hidden="true" />
  );

  // Server, hydration, or a paused text piece: the still frame is the picture.
  if (!live || (paused && still)) return fallback;

  return (
    <ArtBoundary fallback={fallback}>
      <Ascii
        piece={piece}
        options={paused ? { ...options, fps: 0 } : options}
        mono={mono}
        label={label || undefined}
        className={cn("art", className)}
        style={artStyle}
      />
    </ArtBoundary>
  );
}
