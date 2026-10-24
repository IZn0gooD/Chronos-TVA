"use client";

import { AsciiScene } from "@/components/ascii/ascii-scene";
import { nexusFieldNarrow } from "@/components/ascii/pieces/nexus-field";
import { Frame } from "@/components/ui/frame";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { BRANCH_STATE_LABELS } from "@/data/branches";
import { useMotionPaused } from "@/lib/motion-store";
import { useScene } from "@/lib/signals";

/**
 * Section 08's plate: the session readout and the final anomaly. The readout
 * prints what this visit did to the desk (branch under review, files opened,
 * variances registered, effects level); the field returns one last time,
 * as ink, at rest. Both read the shared signals, so the record ends on the
 * state the reader left it in.
 */
export function FinalStatus() {
  const s = useScene((x) => x);
  const paused = useMotionPaused();
  const rows: Array<[string, string]> = [
    ["Branch", `${s.branchId ?? "SL-0"} · ${BRANCH_STATE_LABELS[s.branchState]}`],
    ["Files", s.filesConsulted === 0 ? "none consulted" : `${s.filesConsulted} consulted · last ${s.variantId}`],
    ["Events", s.events === 0 ? "no variance registered" : `${s.events} variance${s.events > 1 ? "s" : ""} registered`],
    ["Motion", paused ? "paused by the reader" : "on"],
    ["Effects", s.effects === "off" ? "off · static plates" : `${s.effects} · WebGL`],
  ];
  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-8">
      <TerminalPanel title="Session readout" meta="desk 07 · local only" className="md:col-span-7" footer="Nothing here left your browser.">
        <dl className="grid gap-2">
          {rows.map(([term, value]) => (
            <div key={term} className="grid grid-cols-[6rem_1fr] gap-4">
              <dt className="text-fg-subtle">{term}</dt>
              <dd className="text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </TerminalPanel>
      <Frame heading="Final reading" light={s.events > 0 ? "anomaly" : "off"} tone="deep" padding="none" className="md:col-span-5">
        <div className="flex h-full min-h-40 items-center justify-center p-4 text-sage">
          <AsciiScene piece={nexusFieldNarrow} mono label="The temporal field, at rest, drawn in ink." options={{ fps: 8 }} size="clamp(6px, 0.8vw, 9px)" />
        </div>
      </Frame>
    </div>
  );
}
