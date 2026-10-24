"use client";

import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";
import { FieldPlate } from "@/components/graphics/field-plate";
import { SceneBoundary, type SceneFailure } from "@/components/graphics/scene-boundary";
import type { Drive } from "@/components/graphics/shader-canvas";
import { Button } from "@/components/ui/button";
import { Frame } from "@/components/ui/frame";
import { useGraphicsQuality } from "@/hooks/use-graphics-quality";
import { useInView } from "@/hooks/use-in-view";
import { usePageVisible } from "@/hooks/use-page-visible";
import { cn } from "@/lib/cn";
import { gsap, MOTION_CONDITIONS, motionAllowed, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scene, triggerTemporalEvent } from "@/lib/signals";
import { PHASES } from "./anomaly-copy";

const ShaderCanvas = dynamic(() => import("@/components/graphics/shader-canvas").then((m) => m.ShaderCanvas), { ssr: false });

const LABEL =
  "The temporal field: concentric interference rings warped by noise, five broken spokes, a bright core; it tightens as the page scrolls and burns orange at its peaks.";

/**
 * Section 03, Temporal anomaly: the field plate. The shader is the picture;
 * the copy reads it in three phases that follow the scroll (pinned on wide
 * screens, scrubbed in place on small ones). The reader can raise the
 * intensity, collapse the field, or trigger a variance, which the chamber
 * in the hero answers too.
 */
export function TemporalAnomaly() {
  const graphics = useGraphicsQuality();
  const [plateRef, inView] = useInView<HTMLDivElement>("20% 0px");
  const visible = usePageVisible();
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [intensity, setIntensity] = useState(0.65);
  const [collapsed, setCollapsed] = useState(false);
  const [failure, setFailure] = useState<SceneFailure | null>(null);
  const progress = useRef(0);
  const collapse = useRef({ value: 0 });
  const id = useId();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const onUpdate = (self: ScrollTrigger) => {
        progress.current = self.progress;
        const next = Math.min(PHASES.length - 1, Math.floor(self.progress * PHASES.length));
        setPhase((p) => (p === next ? p : next));
      };
      // Wide screens with motion: the plate pins while the phases scroll through it.
      mm.add(`(min-width: 64rem) and ${MOTION_CONDITIONS.motionOK}`, () => {
        if (!motionAllowed()) return;
        const st = ScrollTrigger.create({ trigger: el, start: "top top", end: "+=120%", pin: true, pinSpacing: true, scrub: true, onUpdate });
        return () => st.kill();
      });
      // Elsewhere, the phases follow the section's own passage through the viewport.
      mm.add(`(max-width: 63.99rem), ${MOTION_CONDITIONS.reduced}`, () => {
        const st = ScrollTrigger.create({ trigger: el, start: "top 70%", end: "bottom 30%", onUpdate });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    gsap.to(collapse.current, { value: next ? 1 : 0, duration: 1.1, ease: "power3.inOut" });
  };

  // Per frame: scroll tightens the field, the slider sets its floor, the collapse eases, a variance decays over 2.4 s.
  const drive: Drive = (u) => {
    const p = progress.current;
    u.uScroll.value = p;
    u.uIntensity.value = intensity + p * 0.3;
    u.uCollapse.value = collapse.current.value;
    const age = (performance.now() - scene.get().eventAt) / 1000;
    u.uEvent.value = age < 0 || age > 2.4 ? 0 : Math.min(1, age * 10) * (1 - age / 2.4);
  };

  const live = Boolean(graphics.quality) && !failure;
  const readout = !graphics.ready
    ? "Initialising"
    : !graphics.quality
      ? graphics.level === "off"
        ? "Static plate · effects off"
        : "Static plate · WebGL unavailable"
      : failure
        ? "Static plate · renderer fault"
        : `Live · ${graphics.quality.octaves} octaves`;

  return (
    <div
      ref={root}
      className="mx-auto grid w-full max-w-[var(--content-max)] gap-10 px-[var(--gutter)] py-[var(--space-section)] lg:min-h-screen lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:py-24"
    >
      <div className="lg:col-span-5">
        <p className="meta-label text-fg-muted">
          <span className="text-temporal-text">03</span> Temporal anomaly {"//"} Field plate
        </p>
        <h2 id="anomaly-title" className="mt-4 font-display text-title font-medium tracking-tight text-fg-strong">
          The field does not hold.
        </h2>
        <p className="mt-5 max-w-prose text-lead text-fg-muted">
          A procedural field computed on the GPU: interference, displacement, a nexus. Scroll to read it phase by phase; the chamber above answers every
          variance you trigger here.
        </p>
        <ol className="mt-8 grid gap-4" aria-label="Phases of the field">
          {PHASES.map((ph, i) => (
            <li
              key={ph.index}
              aria-current={i === phase ? "step" : undefined}
              className={cn(
                "grid grid-cols-[2.5rem_1fr] gap-3 border-l-2 pl-4 transition-colors duration-[var(--dur-base)]",
                i === phase ? "border-accent text-fg" : "border-line-strong text-fg-muted",
              )}
            >
              <span className="font-mono text-mono text-temporal-text">{ph.index}</span>
              <div>
                <p className="font-display text-body font-medium text-fg-strong">{ph.title}</p>
                <p className="mt-1 text-small">{ph.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 border-t border-line pt-6">
          <div className="grid gap-2">
            <label htmlFor={`${id}-intensity`} className="meta-label flex justify-between text-fg-muted">
              <span>Field intensity</span>
              <span className="tabular text-fg">{intensity.toFixed(2)}</span>
            </label>
            <input
              id={`${id}-intensity`}
              type="range"
              min={0.2}
              max={1}
              step={0.01}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              disabled={!live}
              className="w-full accent-[var(--accent)]"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="md" index="◐" onClick={toggleCollapse} aria-pressed={collapsed} disabled={!live}>
              {collapsed ? "Release the field" : "Collapse the field"}
            </Button>
            <Button variant="accent" size="md" index="▲" onClick={() => triggerTemporalEvent()}>
              Trigger a variance
            </Button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <Frame heading="Field plate · anomaly 0.88" light={phase === 2 ? "anomaly" : "temporal"} stamp={PHASES[phase].title} tone="deep" padding="none">
          <div ref={plateRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-xs">
            <FieldPlate className="absolute inset-0" intensity={intensity} />
            {live && graphics.quality && inView && (
              <SceneBoundary fallback={null} onFailure={setFailure}>
                <ShaderCanvas quality={graphics.quality} active={visible} drive={drive} label={LABEL} className="scene-enter absolute inset-0" />
              </SceneBoundary>
            )}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-between font-mono text-micro uppercase tracking-[0.08em] text-paper/90">
              <span>
                Phase {PHASES[phase].index} · {PHASES[phase].title}
              </span>
              <span className={live ? "text-temporal-text" : "text-paper/70"}>{readout}</span>
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
}
