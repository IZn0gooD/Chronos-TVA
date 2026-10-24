"use client";

import { AsciiScene } from "@/components/ascii/ascii-scene";
import { nexusFieldNarrow } from "@/components/ascii/pieces/nexus-field";
import { Frame, type FrameLight } from "@/components/ui/frame";

interface ObservationWindowProps {
  light: FrameLight;
  stamp?: string;
  className?: string;
}

const LABEL = "Observation window: a singularity bends the sacred timeline; branches tear off and are pruned.";

/**
 * The hero's ASCII instrument: the nexus-field piece in a notched frame with
 * its own light, beside the file note. One size of piece everywhere (44×15),
 * so the server and every screen print the same still frame.
 */
export function ObservationWindow({ light, stamp, className }: ObservationWindowProps) {
  return (
    <Frame heading="Observation" light={light} stamp={stamp} padding="none" tone="deep" className={className}>
      <div className="p-2 pt-3">
        <AsciiScene piece={nexusFieldNarrow} label={LABEL} options={{ fps: 15 }} />
      </div>
    </Frame>
  );
}
