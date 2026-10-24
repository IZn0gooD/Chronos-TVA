"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CornerMarks } from "@/components/ui/corner-marks";
import { EdgeBand } from "@/components/ui/edge-band";
import { Metadata } from "@/components/ui/metadata";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { folio, siteConfig } from "@/config/site";
import { gsap, MOTION_CONDITIONS, motionAllowed, useGSAP } from "@/lib/gsap";
import { scene, triggerTemporalEvent } from "@/lib/signals";
import { FILE_NOTE, FIRST_VARIANCE_AT, TITLE_LINES, VARIANCE_MS } from "./hero-copy";
import { ObservationWindow } from "./observation-window";
import { SacredTimeline } from "./sacred-timeline";
import { ScrollCue } from "./scroll-cue";
import { TemporalChamber } from "./temporal-chamber";

/** The stations point at sections that exist; with a feature off, they fall back to the colophon. */
const enterHref = siteConfig.features.timelineExplorer ? "/#timeline-explorer" : "/#system-status";
const archiveHref = siteConfig.features.variantRegistry ? "/#variant-registry" : "/#system-status";
const nextHref = siteConfig.features.temporalAnomaly ? "#temporal-anomaly" : siteConfig.features.variantRegistry ? "#variant-registry" : "#system-status";

/**
 * Section 02, Hero / Sacred Timeline: the cover of the folder.
 *
 * Composition, wide screens: the title in three lines on the left; the
 * temporal chamber (the 3D instrument) on the right, as tall as the title
 * and the file note together; under the title, the file note and the two
 * controls beside the ASCII observation window; then the rail across the
 * sheet with the two actions standing on it as stations; the sage spine
 * hugs the right edge. Small screens stack: title, chamber, note, window,
 * rail.
 *
 * The signature interaction is a misregistration: a variance slides an
 * orange third ink out from under the title, lights the instruments, and
 * the chamber ripples (Theatre.js); when the desk registers it everything
 * snaps back into register and a stamp prints. A variance is one shared
 * signal (`triggerTemporalEvent`): the entrance fires it once, the button
 * here and the one in the anomaly section fire it again.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [variance, setVariance] = useState(false);
  const [stamp, setStamp] = useState<string | undefined>(undefined);
  const [notice, setNotice] = useState("");
  const [replay, setReplay] = useState(0);
  const timer = useRef<number | null>(null);

  const runVariance = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setVariance(true);
    setStamp(undefined);
    setNotice("Variance detected on the sacred line.");
    timer.current = window.setTimeout(() => {
      setVariance(false);
      setStamp("Registered");
      setNotice("Variance registered. The line is back in register.");
      timer.current = null;
    }, VARIANCE_MS);
  }, []);

  // Every variance, whoever triggered it, plays the misregistration here.
  useEffect(() => {
    let seen = scene.get().events;
    const unsubscribe = scene.subscribe(() => {
      const { events } = scene.get();
      if (events === seen) return;
      seen = events;
      runVariance();
    });
    return () => {
      unsubscribe();
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [runVariance]);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      /** Everything in place, no choreography: the printed state. */
      const settle = () => {
        root.classList.remove("hero-pending");
        setStamp("Registered");
      };

      /**
       * The entrance. Before hydration the CSS class `hero-pending` holds the
       * start states (see base.css), so nothing flashes; the timeline sets the
       * same start states inline, drops the class, then plays to the final
       * state the CSS describes.
       */
      const entrance = () => {
        setStamp(undefined);
        // `y: 0` matters: GSAP reads the CSS translateY(110%) of the pending state as a pixel offset
        // and would otherwise keep it under the percentage tween.
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.set(".hero-line-inner", { yPercent: 110, y: 0 }, 0)
          .set([".hero-window", ".hero-meta", ".hero-station"], { autoAlpha: 0 }, 0)
          .call(() => root.classList.remove("hero-pending"), undefined, 0)
          .to(".hero-line-inner", { yPercent: 0, y: 0, duration: 0.9, stagger: 0.1 }, 0.05)
          .to(".hero-window", { autoAlpha: 1, duration: 0.6, stagger: 0.15 }, 0.6)
          .fromTo(".hero-meta", { y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 1.1)
          .fromTo(".hero-station", { y: 6 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12 }, 1.7)
          // The first variance, scripted, once the chamber has settled: every instrument answers it.
          .call(() => triggerTemporalEvent(), undefined, FIRST_VARIANCE_AT);
        return tl;
      };

      // An explicit replay is the reader's intent: it plays whatever the preference.
      if (replay > 0) {
        entrance();
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS.motionOK, () => {
        if (!motionAllowed()) {
          settle();
          return;
        }
        entrance();
      });
      mm.add(MOTION_CONDITIONS.reduced, settle);
      return () => mm.revert();
    },
    { scope: ref, dependencies: [replay], revertOnUpdate: true },
  );

  const light = variance ? "anomaly" : "temporal";

  return (
    <section
      ref={ref}
      id="sacred-timeline"
      aria-labelledby="hero-title"
      data-variance={variance}
      className="hero-pending relative scroll-mt-20 bg-bg pt-[var(--header-h)] text-fg lg:pt-[calc(var(--header-h)+3rem)]"
    >
      <CornerMarks position="top" className="hidden lg:block inset-x-[var(--gutter)] top-[calc(var(--header-h)+1.25rem)] lg:right-[calc(var(--spine-w)+var(--gutter))]" />
      <EdgeBand
        items={[`${siteConfig.name} · ${siteConfig.designation}`, `Dossier 00/${String(siteConfig.folios).padStart(2, "0")}`, "General circulation", "Specimen"]}
        figure={folio(1)}
      />

      <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--gutter)] pt-8 lg:pt-0 lg:pr-[calc(var(--spine-w)+var(--gutter))]">
        <div className="hero-meta flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
          <p className="meta-label text-fg-muted">
            TVA <span className="text-fg-subtle">{"//"}</span> Analysis Division <span className="text-fg-subtle">{"//"}</span> Desk 07
          </p>
          <StatusIndicator
            status={variance ? "anomaly" : "temporal"}
            label={variance ? "Variance detected" : "Sacred timeline stable"}
            detail={variance ? "VAR 0.03" : "VAR 0.00"}
          />
        </div>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-x-8">
          <h1 id="hero-title" className="font-display text-display font-medium text-fg-strong lg:col-span-7 lg:row-start-1">
            {TITLE_LINES.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em] pr-[0.04em]">
                <span className="hero-line-inner relative block">
                  <span aria-hidden="true" className="hero-ghost absolute inset-0 text-accent">
                    {line}
                  </span>
                  <span className="relative">{line}</span>
                </span>
              </span>
            ))}
          </h1>

          <div className="hero-window lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <TemporalChamber variance={variance} />
            <div className="mt-4 hidden justify-end lg:flex">
              <ScrollCue href={nextHref} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,17rem)] sm:items-start lg:col-span-7 lg:row-start-2">
            <div className="hero-meta max-w-[38ch]">
              <p className="meta-label text-fg-subtle">File note 01</p>
              <p className="mt-3 text-lead text-fg-muted">{FILE_NOTE}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Button variant="accent" size="md" index="▲" onClick={() => !variance && triggerTemporalEvent()} aria-disabled={variance}>
                  Simulate a variance event
                </Button>
                <Button variant="ghost" size="md" index="↻" onClick={() => setReplay((n) => n + 1)}>
                  Replay the entrance
                </Button>
              </div>
              <p role="status" className="mt-3 min-h-[1.25rem] font-mono text-micro text-fg-subtle">
                {notice}
              </p>
            </div>
            <div className="hero-window">
              <ObservationWindow light={light} stamp={stamp} />
            </div>
          </div>
        </div>

        {/* The rail. The two actions stand on it as stations on wide screens. */}
        <div className="hero-meta relative mt-10 lg:mt-14">
          <SacredTimeline delay={0.9} replay={replay} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:absolute lg:left-[3.4%] lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 lg:gap-4">
            <Button href={enterHref} size="lg" index="01" className="hero-station">
              Enter the system
            </Button>
            <Button href={archiveHref} size="lg" variant="secondary" index="02" className="hero-station bg-bg">
              Consult the archives
            </Button>
          </div>
        </div>

        <div className="hero-meta mt-10 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between lg:mt-14">
          <Metadata
            layout="row"
            className="sm:grid-cols-[auto_1fr_auto_1fr]"
            items={[
              { term: "System", value: `${siteConfig.name} / ${siteConfig.systemId}` },
              { term: "State", value: variance ? "Variance under review" : "Sacred line stable" },
            ]}
          />
          <div className="lg:hidden">
            <ScrollCue href={nextHref} />
          </div>
        </div>
      </div>
    </section>
  );
}
