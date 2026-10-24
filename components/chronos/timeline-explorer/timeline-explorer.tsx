"use client";

import { m } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Frame, type FrameLight } from "@/components/ui/frame";
import { Metadata } from "@/components/ui/metadata";
import { useHydrated } from "@/hooks/use-hydrated";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/cn";
import { selectBranch } from "@/lib/signals";
import type { Branch, BranchState } from "@/types/content";
import { BranchDiagram } from "./branch-diagram";

interface TimelineExplorerProps {
  branches: readonly Branch[];
  stateLabels: Record<BranchState, string>;
  /** Shown under the panel: the data is fictional and must say so. */
  notice: string;
}

const TONE: Record<BranchState, BadgeTone> = {
  sacred: "temporal",
  nexus: "accent",
  pruned: "outline",
  contained: "sage",
};

const LIGHT: Record<BranchState, FrameLight> = {
  sacred: "temporal",
  nexus: "anomaly",
  pruned: "off",
  contained: "stable",
};

/** Marker shapes for the small-screen list-diagram: shape and colour together, as in the legend. */
const MARKER: Record<BranchState, string> = {
  sacred: "bg-temporal",
  nexus: "bg-accent",
  pruned: "bg-transparent ring-1 ring-inset ring-fg-subtle [background:repeating-linear-gradient(45deg,var(--fg-subtle)_0_1px,transparent_1px_3px)]",
  contained: "bg-transparent border-2 border-sage",
};

/** Legend entries pair a shape with a colour, so neither carries the meaning alone. */
const LEGEND: ReadonlyArray<{ state: BranchState; glyph: string; className: string }> = [
  { state: "sacred", glyph: "●", className: "text-temporal-text" },
  { state: "contained", glyph: "○", className: "text-sage" },
  { state: "pruned", glyph: "┄", className: "text-fg-subtle" },
  { state: "nexus", glyph: "▲", className: "text-accent-text" },
];

/**
 * Interactive branch explorer. The tablist of branches is the accessible
 * control (arrow keys, Home/End); the diagram's markers are pointer
 * shortcuts to the same state; the panel is the tabpanel.
 */
export function TimelineExplorer({ branches, stateLabels, notice }: TimelineExplorerProps) {
  const [selectedId, setSelectedId] = useState(branches[0]?.id ?? "");
  const wide = useMediaQuery("(min-width: 48rem)", true);
  const hydrated = useHydrated();
  const baseId = useId();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const selected = branches.find((b) => b.id === selectedId) ?? branches[0];

  // The selection is a shared signal: the header's status, the chamber's orbitals and the final readout follow it.
  useEffect(() => {
    const index = branches.findIndex((b) => b.id === selectedId);
    const branch = branches[index];
    if (branch) selectBranch(branch.state === "sacred" ? null : branch.id, branch.state, index);
  }, [branches, selectedId]);

  const focusTab = (id: string) => {
    setSelectedId(id);
    tabRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = branches.findIndex((b) => b.id === selectedId);
    const last = branches.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (index + 1) % branches.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (index - 1 + branches.length) % branches.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next === -1) return;
    event.preventDefault();
    focusTab(branches[next].id);
  };

  if (!selected) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
      <div className="min-w-0 lg:col-span-8">
        <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-micro uppercase tracking-[0.08em] text-fg-muted" aria-label="Legend">
          {LEGEND.map((item) => (
            <li key={item.state} className="flex items-center gap-2">
              <span className={item.className} aria-hidden="true">
                {item.glyph}
              </span>
              {stateLabels[item.state]}
            </li>
          ))}
        </ul>
        {/* The plate, on screens wide enough to read it. Small screens get the list-diagram below instead. */}
        <div className="hidden md:block">
          {wide && <BranchDiagram branches={branches} selectedId={selectedId} onSelect={setSelectedId} />}
        </div>

        {/*
          The branch list is the accessible control everywhere. On small
          screens it is also the diagram: a vertical teal rail with a marker
          per branch; on wide screens, a row of chips under the plate.
        */}
        <div
          role="tablist"
          aria-label="Timeline branches"
          aria-orientation={wide ? "horizontal" : "vertical"}
          onKeyDown={onKeyDown}
          className="mt-2 flex flex-col border-l-2 border-temporal md:mt-8 md:flex-row md:flex-wrap md:gap-2 md:border-0"
        >
          {branches.map((branch) => {
            const active = branch.id === selectedId;
            return (
              <button
                key={branch.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(branch.id, el);
                  else tabRefs.current.delete(branch.id);
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${branch.id}`}
                aria-selected={active}
                aria-controls={`${baseId}-panel`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelectedId(branch.id)}
                className={cn(
                  "relative flex items-center gap-3 text-left font-mono text-mono transition-colors duration-[var(--dur-fast)]",
                  "min-h-14 w-full border-b border-line py-3 pl-7 pr-3 md:min-h-0 md:w-auto md:shrink-0 md:rounded-xs md:border-0 md:px-3 md:py-2",
                  active ? "text-bg" : "text-fg-muted hover:bg-surface-2 hover:text-fg md:bg-surface-1",
                )}
              >
                {/* The selection slides between tabs: one element, one layoutId, Motion does the rest. */}
                {active && <m.span layoutId={`${baseId}-indicator`} className="absolute inset-0 bg-fg md:rounded-xs" aria-hidden="true" />}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[7px] top-1/2 z-10 h-3 w-3 -translate-y-1/2 ring-2 ring-bg md:hidden",
                    MARKER[branch.state],
                    active && "scale-125",
                  )}
                />
                <span className="tabular relative">{branch.id}</span>
                <span className={cn("relative", active ? "text-bg" : "text-fg-muted")}>{branch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${selected.id}`}
        tabIndex={0}
        className="min-w-0 lg:col-span-4"
      >
        <Frame
          heading={`Branch file · ${selected.id}`}
          light={LIGHT[selected.state]}
          stamp={selected.state === "nexus" ? "Nexus event logged" : selected.state === "pruned" ? "Pruned" : undefined}
          tone="surface"
          className="h-full"
        >
          {/* Keyed on the branch: the panel re-mounts and enters; no exit, so the content is never stale. */}
          <m.div
            key={selected.id}
            initial={hydrated ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-heading font-medium tracking-tight text-fg">{selected.label}</h3>
              <Badge tone={TONE[selected.state]}>{stateLabels[selected.state]}</Badge>
            </div>
            <p className="mt-5 text-body text-fg-muted">{selected.summary}</p>
            <Metadata
              className="mt-6 grid-cols-2"
              items={[
                { term: "Identifier", value: selected.id },
                { term: "Divergence (fictional)", value: selected.divergence },
                { term: "Origin", value: `${Math.round(selected.origin * 100)} % along the baseline` },
                { term: "Status", value: stateLabels[selected.state] },
              ]}
            />
            <ol className="mt-8 space-y-4 border-l border-line pl-5">
              {selected.events.map((event) => (
                <li key={event.at + event.note} className="relative">
                  <span className="absolute -left-[1.4rem] top-2 h-1.5 w-1.5 rounded-full bg-temporal" aria-hidden="true" />
                  <p className="meta-label text-temporal-text">{event.at}</p>
                  <p className="mt-1 text-small text-fg">{event.note}</p>
                </li>
              ))}
            </ol>
            <p className="mt-auto pt-8 font-mono text-micro text-fg-subtle">{notice}</p>
          </m.div>
        </Frame>
      </div>
    </div>
  );
}
