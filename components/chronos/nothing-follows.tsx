"use client";

import { AsciiScene } from "@/components/ascii/ascii-scene";
import { typedLine } from "@/components/ascii/pieces/typed-line";

/** Made once: the closing line types itself when it scrolls into view and holds, cursor blinking. */
const piece = typedLine(["// NOTHING FOLLOWS //"], { speed: 28 });

/** The last words of the record. The only animation on the site that never ends: one cursor. */
export function NothingFollows() {
  return (
    <div className="text-sage">
      <AsciiScene piece={piece} label="Nothing follows." size="0.8125rem" />
    </div>
  );
}
