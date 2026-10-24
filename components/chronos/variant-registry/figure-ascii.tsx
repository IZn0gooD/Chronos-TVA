"use client";

import type { Piece } from "ascii.rest";
import * as fern from "ascii.rest/pieces/fern";
import * as waveInterference from "ascii.rest/pieces/wave-interference";
import { AsciiScene } from "@/components/ascii/ascii-scene";
import { cn } from "@/lib/cn";
import type { VariantArt } from "@/types/content";

/** The pieces a registry file may name in `art`. A module with `meta` and `default` is a Piece. */
const ART: Record<VariantArt, Piece> = {
  fern,
  interference: waveInterference,
};

/**
 * An ascii.rest piece as a card figure: text, in the card's current colour,
 * sized from the container so the piece fills its frame at any width
 * (a cell is 0.6em wide and 1.2em tall; the frame is 4:3). Decorative.
 */
export function FigureAscii({ art, className }: { art?: VariantArt; className?: string }) {
  if (!art) return null;
  const piece = ART[art];
  const { cols, rows } = piece.meta;
  const size = `min(calc(100cqw / ${(cols * 0.6).toFixed(1)}), calc(75cqw / ${(rows * 1.2).toFixed(1)}))`;
  return (
    <div className={cn("flex h-full w-full items-center justify-center overflow-hidden text-sage [container-type:inline-size]", className)} aria-hidden="true">
      <AsciiScene piece={piece} label="" size={size} options={{ fps: 12 }} />
    </div>
  );
}
