"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";
import { BOOT_DURATION, bootLines } from "@/data/boot";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

const SEEN_KEY = "chronos:boot-seen";

function readSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode: the sequence simply plays again next time */
  }
}

/** True once this session has already seen the boot; false on the server. */
function useSeenThisSession() {
  return useSyncExternalStore(
    () => () => {},
    readSeen,
    () => false,
  );
}

/**
 * System Boot: a transmission slip, two seconds of diagnostics in a
 * terminal window, then the overlay wipes away to reveal the page.
 * Skippable (button or Escape), plays once per session, never for readers
 * who prefer reduced motion, and expires by CSS if scripts never run. The
 * page underneath is in the HTML the whole time.
 */
export function BootSequence() {
  const reduced = useReducedMotion();
  const seen = useSeenThisSession();
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const finishRef = useRef<() => void>(() => {});

  const play = siteConfig.features.bootSequence && !reduced && !seen && !done;

  useGSAP(
    () => {
      if (!play || !ref.current) return;
      const root = ref.current;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        markSeen();
        gsap.to(root, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.7,
          ease: "power3.inOut",
          onComplete: () => setDone(true),
        });
      };
      finishRef.current = finish;

      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ onComplete: finish });
      for (const [i, line] of bootLines.entries()) {
        tl.set(q(`.boot-line-${i}`), { autoAlpha: 1 }, line.at);
        if (line.tone) tl.set(q(`.boot-status-${i}`), { autoAlpha: 1 }, line.at + 0.18);
      }
      tl.fromTo(q(".boot-progress"), { scaleX: 0 }, { scaleX: 1, duration: BOOT_DURATION, ease: "power1.inOut" }, 0);
      tl.to({}, { duration: 0.35 }, BOOT_DURATION);

      const safety = window.setTimeout(finish, siteConfig.animation.bootMaxDuration + 1000);
      return () => window.clearTimeout(safety);
    },
    { dependencies: [play] },
  );

  useEffect(() => {
    if (!play) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play]);

  if (!play) return null;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="System boot"
      className="boot fixed inset-0 z-[var(--z-boot)] bg-bg-deep text-fg"
      style={{ animation: `boot-expire 0.6s ease-in ${(siteConfig.animation.bootMaxDuration + 2500) / 1000}s forwards` }}
    >
      <noscript>
        <style>{`.boot{display:none}`}</style>
      </noscript>
      <style>{`@keyframes boot-expire{to{opacity:0;visibility:hidden;pointer-events:none}}`}</style>

      <div className="mx-auto flex h-full w-full max-w-[var(--content-max)] flex-col px-[var(--gutter)] py-6">
        <div className="flex items-center justify-between gap-4">
          <span className="meta-label text-fg-subtle">
            {siteConfig.systemId} · Transmission slip · Folio 00/07
          </span>
          <button
            type="button"
            onClick={() => finishRef.current()}
            className="meta-label rounded-xs px-3 py-2 text-fg-muted ring-1 ring-inset ring-line-strong transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Skip <span aria-hidden="true">· Esc</span>
          </button>
        </div>

        <div className="my-auto w-full max-w-xl lg:mb-[14vh]">
          <TerminalPanel
            title={`${siteConfig.name} · ${siteConfig.designation}`}
            meta="Specimen"
            footer={
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-line-strong">
                  <div className="boot-progress h-px w-full origin-left bg-temporal" />
                </div>
                <span className="text-micro">build 1962.44</span>
              </div>
            }
          >
            <ol aria-hidden="true">
              {bootLines.map((line, i) => {
                const last = i === bootLines.length - 1;
                return (
                  <li key={line.text} className={cn(`boot-line-${i} invisible flex items-baseline gap-4 py-0.5`, last && "mt-3")}>
                    <span className="w-14 shrink-0 text-fg-subtle tabular">{line.at.toFixed(2).padStart(5, "0")}</span>
                    <span className={cn("flex-1", last ? "text-temporal-text" : "text-fg-muted")}>{line.text}</span>
                    {line.tone && (
                      <span className={cn(`boot-status-${i} invisible shrink-0`, line.tone === "ok" ? "text-sage" : "text-temporal-text")}>
                        {line.tone === "ok" ? "OK" : "GRANTED"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </TerminalPanel>
        </div>
      </div>
    </div>
  );
}
