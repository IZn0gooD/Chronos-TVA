"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { SceneBoundary, type SceneFailure } from "@/components/graphics/scene-boundary";
import { useGraphicsQuality } from "@/hooks/use-graphics-quality";
import { usePageVisible } from "@/hooks/use-page-visible";
import { cn } from "@/lib/cn";
import { CINEMATIC_END, PHASES } from "@/lib/multiverse/simulation";
import { budgetFor, LabEngine } from "./engine";
import { createLabStore, useLab, type LabSnapshot, type SelectionInfo } from "./lab-store";

// three.js, R3F, the composer and the controls ship in their own chunk, only to browsers that can draw them.
const MultiverseScene = dynamic(() => import("./scene").then((m) => m.MultiverseScene), { ssr: false });

const LABEL =
  "A living multiverse: golden filaments woven from a loom on the left grow into a network of branching timelines; pulses of light travel along them, distant branches braid together in teal, and some are pruned and dissolve.";

const fmt = (n: number, digits = 0) => n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function Panel({ title, children, className, labelledBy }: { title: ReactNode; children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cn("pointer-events-auto rounded-xs bg-bg-deep/90 ring-1 ring-inset ring-line-strong backdrop-blur-sm", className)}>
      <h2 id={labelledBy} className="meta-label border-b border-line-strong px-4 py-2 text-fg-muted">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

function HudButton({ children, onClick, disabled, pressed, tone = "plain", label }: { children: ReactNode; onClick: () => void; disabled?: boolean; pressed?: boolean; tone?: "plain" | "accent"; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xs px-3 font-mono text-mono transition-colors duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-45",
        // One colour set per state, never two text colours competing on the same element.
        pressed
          ? "bg-fg text-bg ring-1 ring-inset ring-fg"
          : tone === "accent"
            ? "bg-accent-fill text-on-accent hover:bg-warm"
            : "text-fg ring-1 ring-inset ring-line-strong hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

function Readouts({ s }: { s: LabSnapshot }) {
  const rows: Array<[string, string]> = [
    ["Simulated time", `T+${fmt(s.simTime, 1)} s`],
    ["Live timelines", `${fmt(s.live)} / ${fmt(s.capacity)}`],
    ["Born · pruned", `${fmt(s.born)} · ${fmt(s.pruned)}`],
    ["Weaves · pulses", `${fmt(s.woven)} · ${fmt(s.pulses)}`],
    ["Frame", s.fps ? `${fmt(s.fps)} fps · ${fmt(s.frameMs, 1)} ms` : "—"],
    ["Draw calls", s.calls ? `${fmt(s.calls)} · ${fmt(s.triangles / 1000)}k tris` : "—"],
    ["Quality", `L${s.level} ${s.pinned ? "pinned" : "auto"} · dpr ${fmt(s.dpr, 2)} · ${fmt(s.particles)} motes · bloom ${s.bloom ? "on" : "off"}`],
  ];
  return (
    <dl className="grid gap-1.5 font-mono text-micro">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3">
          <dt className="uppercase tracking-[0.08em] text-fg-subtle">{k}</dt>
          <dd className="text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function TimelineFile({ sel, engine }: { sel: SelectionInfo; engine: LabEngine }) {
  const facts: Array<[string, string]> = [
    ["Kind", sel.kind === "root" ? "Sacred line" : sel.kind === "fabric" ? "Fabric thread" : sel.kind === "weave" ? "Weave" : "Branch"],
    ["State", sel.state],
    ["Parent", sel.parent ?? "the loom"],
    ["Depth", String(sel.depth)],
    ["Born", `T+${fmt(sel.born, 1)}`],
    ["Age", `${fmt(sel.age, 1)} s`],
    ["Energy", fmt(sel.energy, 2)],
    ["Stability", fmt(sel.stability, 2)],
    ["Children", String(sel.children)],
    ["Descendants", String(sel.descendants)],
  ];
  return (
    <aside aria-label={`Timeline file ${sel.name}`} className="pointer-events-auto rounded-xs bg-bg-deep/90 ring-1 ring-inset ring-line-strong backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-line-strong px-4 py-2">
        <h2 className="meta-label text-fg">
          Timeline file · <span className="text-temporal-text">{sel.name}</span>
        </h2>
        <button type="button" onClick={() => engine.select(null)} className="meta-label rounded-xs px-2 py-1 text-fg-muted hover:bg-surface-2 hover:text-fg" aria-label="Close the timeline file">
          ✕
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4 py-3 font-mono text-micro">
        {facts.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="uppercase tracking-[0.08em] text-fg-subtle">{k}</dt>
            <dd className={cn("text-right text-fg", k === "State" && (v === "unstable" || v === "dissolving") && "text-accent-text")}>{v}</dd>
          </div>
        ))}
        {sel.weave && (
          <div className="col-span-2 flex justify-between gap-2">
            <dt className="uppercase tracking-[0.08em] text-fg-subtle">Bridges</dt>
            <dd className="text-temporal-text">{sel.weave}</dd>
          </div>
        )}
      </dl>
      <div className="grid gap-2 border-t border-line-strong px-4 py-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Walk the lineage">
          <HudButton onClick={() => engine.selectRelative("parent")} disabled={!sel.canParent} label="Parent timeline">
            ↑ Parent
          </HudButton>
          <HudButton onClick={() => engine.selectRelative("child")} disabled={!sel.canChild} label="First child timeline">
            ↓ Child
          </HudButton>
          <HudButton onClick={() => engine.selectRelative("previous")} disabled={!sel.canSibling} label="Previous sibling">
            ←
          </HudButton>
          <HudButton onClick={() => engine.selectRelative("next")} disabled={!sel.canSibling} label="Next sibling">
            →
          </HudButton>
          <HudButton onClick={() => engine.focusSelected()}>Focus</HudButton>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Act on this timeline">
          <HudButton onClick={() => engine.command("pulse")}>Pulse</HudButton>
          <HudButton onClick={() => engine.command("branch")} disabled={!sel.canBranch}>
            Branch here
          </HudButton>
          <HudButton onClick={() => engine.command("collapse")} disabled={!sel.canPrune} tone="accent">
            Prune
          </HudButton>
        </div>
      </div>
    </aside>
  );
}

/**
 * The multiverse lab: a full-screen, living network of timelines built on
 * the same stack as the terminal (R3F, GLSL, Theatre.js), with a HUD that
 * reads the simulation and commands it. Without WebGL, or with effects off,
 * the server-rendered plate (the same simulation at T+24, drawn in SVG) is
 * the picture.
 */
export function MultiverseLab({ plate }: { plate: ReactNode }) {
  const graphics = useGraphicsQuality();
  const visible = usePageVisible();
  const [store] = useState(createLabStore);
  const s = useLab(store);
  const [failure, setFailure] = useState<SceneFailure | null>(null);
  const [touched, setTouched] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const rateId = useId();
  const densityId = useId();
  const controlsId = useId();
  const readoutsId = useId();
  const feedId = useId();

  const engine = useMemo(() => {
    if (!graphics.quality) return null;
    const search = new URLSearchParams(window.location.search);
    const studio = process.env.NODE_ENV === "development" && search.has("studio");
    return new LabEngine(budgetFor(graphics.quality, search), store, { studio, reduced: !graphics.quality.animate });
  }, [graphics.quality, store]);

  useEffect(() => () => engine?.dispose(), [engine]);

  // The title's opacity is the one DOM property Theatre owns (it fades in at the revelation).
  useEffect(() => {
    if (!engine) return;
    return engine.theatre.onTitle((o) => {
      if (titleRef.current) titleRef.current.style.opacity = String(o);
    });
  }, [engine]);

  useEffect(() => {
    if (!engine) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") engine.select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine]);

  const live = Boolean(engine) && !failure;
  const status = !graphics.ready
    ? "Initialising"
    : !graphics.quality
      ? graphics.level === "off"
        ? "Static plate · effects off"
        : "Static plate · WebGL unavailable"
      : failure
        ? "Static plate · renderer fault"
        : s.status === "live"
          ? "Live"
          : "Initialising";
  const frameloop = !visible ? "never" : s.reduced && !s.animating ? "demand" : "always";
  const phaseIndex = PHASES.findIndex((p) => p.name === s.phase);
  // Once the reader takes the camera, the title steps aside (React owns this wrapper, Theatre the title inside).
  // It also leaves on its own a few seconds into the perpetual evolution: the network is the subject from then on.
  const titleAside = live && s.mode === "explore" && (touched || s.selection !== null || s.simTime > CINEMATIC_END + 8);

  return (
    <main id="main" className="fixed inset-0 overflow-hidden bg-[#07090a] text-fg">
      <div className="absolute inset-0" aria-hidden={live ? true : undefined}>
        {plate}
      </div>

      {live && engine && (
        <div
          className="absolute inset-0 touch-none"
          role="img"
          aria-label={LABEL}
          onPointerDown={(e) => {
            pointer.current = { x: e.clientX, y: e.clientY };
            engine.noteInput();
            if (s.mode === "explore") setTouched(true);
          }}
          onPointerUp={(e) => {
            const d = pointer.current;
            pointer.current = null;
            if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
            const r = e.currentTarget.getBoundingClientRect();
            engine.select(engine.pick(e.clientX - r.left, e.clientY - r.top, r.width, r.height));
          }}
        >
          <SceneBoundary fallback={null} onFailure={setFailure}>
            <div className="scene-enter absolute inset-0">
              <MultiverseScene engine={engine} frameloop={frameloop} />
            </div>
          </SceneBoundary>
        </div>
      )}

      <div className={cn("pointer-events-none absolute left-[var(--gutter)] top-[19%] transition-opacity duration-[var(--dur-slow)]", titleAside && "opacity-0")}>
        <div ref={titleRef} style={{ opacity: live ? 0 : 1 }}>
          <p className="meta-label text-fg-muted">CHRONOS · Multiverse lab</p>
          <h1 className="mt-3 max-w-[24ch] font-display text-title font-medium uppercase leading-[0.95] tracking-tight text-fg-strong">Every branch is a world.</h1>
        </div>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-[var(--gutter)] pt-4">
        <div className="pointer-events-auto flex items-center gap-4">
          <Link href="/" className="meta-label rounded-xs bg-bg-deep/80 px-2 py-1 text-fg-muted ring-1 ring-inset ring-line-strong hover:bg-surface-2 hover:text-fg">
            ← Terminal
          </Link>
          <span className="meta-label hidden text-fg-subtle sm:inline">Lab · test bench · {status}</span>
        </div>
        <div className="w-[min(22rem,58vw)] text-right">
          <p className="meta-label text-temporal-text">
            {!live
              ? "Static plate"
              : s.mode === "cinematic"
                ? `Movement ${String(Math.max(phaseIndex, 0) + 1).padStart(2, "0")} / 05`
                : s.era !== null
                  ? `Era ${String(s.era + 1).padStart(2, "0")}`
                  : "Explore"}{" "}
            · <span className="text-fg">{live ? s.phase : `T+${CINEMATIC_END} · Revelation`}</span>
          </p>
          <p className="mt-1 hidden text-small text-fg-muted sm:block">{live ? s.phaseNote : "The network the cinematic ends on."}</p>
          {live && s.mode === "explore" && (
            <p className="meta-label mt-2 text-fg-subtle">
              {s.playing ? "Evolving" : "Time held"} · {s.autopilot ? (s.shot ? `Autopilot · ${s.shot}` : "Autopilot waits for you to let go") : "Your camera"}
            </p>
          )}
          {live && s.mode === "cinematic" && (
            <div className="mt-2 h-px w-full bg-line-strong" aria-hidden="true">
              <div className="h-px origin-left bg-accent" style={{ transform: `scaleX(${s.cinematicProgress})` }} />
            </div>
          )}
          {s.studio && <p className="meta-label mt-2 text-fg-subtle">Studio open · the playhead drives the simulation</p>}
        </div>
      </header>

      {live && engine && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-28 flex flex-col justify-end gap-3 p-[var(--gutter)] pb-4 pt-0 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 lg:w-[24rem]">
            <Panel title="Readouts" labelledBy={readoutsId} className="hidden md:block">
              <Readouts s={s} />
            </Panel>
            <Panel title="Event feed" labelledBy={feedId} className={cn("hidden md:block", s.selection && "md:hidden lg:block")}>
              <ol className="grid gap-1 font-mono text-micro">
                {s.feed.length === 0 && <li className="text-fg-subtle">Nothing yet. The loom is warming.</li>}
                {s.feed.slice(0, 4).map((f) => (
                  <li key={f.key} className="flex gap-3">
                    <span className="shrink-0 text-fg-subtle">{f.time}</span>
                    <span className={cn(f.tone === "collapse" ? "text-accent-text" : f.tone === "weave" ? "text-temporal-text" : f.tone === "era" ? "text-fg-strong" : "text-fg")}>{f.text}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>

          <div className="pointer-events-auto flex max-h-[62vh] min-h-0 flex-col gap-3 overflow-y-auto lg:max-h-full lg:w-[25rem]">
            {s.selection && <TimelineFile sel={s.selection} engine={engine} />}
            <Panel
              labelledBy={controlsId}
              title={
                <span className="flex items-center justify-between gap-3">
                  Controls
                  <button type="button" onClick={() => setControlsOpen((o) => !o)} aria-expanded={controlsOpen} className="rounded-xs px-2 py-0.5 text-fg ring-1 ring-inset ring-line-strong md:hidden">
                    {controlsOpen ? "Hide" : "Show"}
                  </button>
                </span>
              }
            >
              <div className={cn(!controlsOpen && "hidden md:block")}>
                <div className="flex flex-wrap gap-2">
                  {s.mode === "cinematic" ? (
                    <>
                      <HudButton onClick={() => engine.togglePlay()}>{s.playing ? "Pause" : "Resume"}</HudButton>
                      <HudButton onClick={() => engine.skipToNetwork()}>Skip to the network</HudButton>
                    </>
                  ) : (
                    <>
                      <HudButton onClick={() => engine.playCinematic()} tone="accent">
                        ▶ Cinematic
                      </HudButton>
                      <HudButton onClick={() => engine.togglePlay()}>{s.playing ? "Hold time" : "Let it live"}</HudButton>
                      <HudButton onClick={() => engine.setAutopilot(!s.autopilot)} pressed={s.autopilot} label={s.autopilot ? "Autopilot on: turn it off" : "Autopilot off: turn it on"}>
                        Autopilot
                      </HudButton>
                    </>
                  )}
                  <HudButton onClick={() => engine.command("pulse", null)}>Pulse the loom</HudButton>
                  <HudButton onClick={() => engine.pruneSomething()}>Prune a branch</HudButton>
                  <HudButton onClick={() => engine.selectAny()}>Pick a timeline</HudButton>
                </div>
                <div className="mt-3 grid gap-2.5">
                  <label htmlFor={rateId} className="grid gap-1">
                    <span className="meta-label flex justify-between text-fg-muted">
                      <span>Expansion rate</span>
                      <span className="text-fg">{s.mode === "cinematic" ? "set by the cinematic" : `× ${fmt(s.expansionRate, 2)}`}</span>
                    </span>
                    <input id={rateId} type="range" min={0} max={3} step={0.05} value={s.expansionRate} disabled={s.mode === "cinematic"} onChange={(e) => engine.setExpansionRate(Number(e.target.value))} className="w-full accent-[var(--accent)] disabled:opacity-45" />
                  </label>
                  <label htmlFor={densityId} className="grid gap-1">
                    <span className="meta-label flex justify-between text-fg-muted">
                      <span>Visible density</span>
                      <span className="text-fg">{fmt(s.density * 100)} %</span>
                    </span>
                    <input id={densityId} type="range" min={0.05} max={1} step={0.01} value={s.density} onChange={(e) => engine.setDensity(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
                  </label>
                  <div className="flex items-center gap-2" role="group" aria-label="Quality level">
                    <span className="meta-label mr-1 text-fg-muted">Quality</span>
                    {([0, 1, 2] as const).map((l) => (
                      <HudButton key={l} pressed={s.pinned && s.level === l} onClick={() => engine.pinLevel(l)} label={`Quality level ${l}${l === 0 ? ", highest" : l === 2 ? ", lightest" : ""}`}>
                        L{l}
                      </HudButton>
                    ))}
                  </div>
                </div>
                <p className="mt-3 font-mono text-micro text-fg-subtle">Drag to orbit · scroll to zoom · click a filament · Esc</p>
              </div>
              <div className={cn("flex flex-wrap gap-2", controlsOpen ? "hidden" : "md:hidden")}>
                {s.mode === "cinematic" ? (
                  <HudButton onClick={() => engine.skipToNetwork()}>Skip to the network</HudButton>
                ) : (
                  <HudButton onClick={() => engine.playCinematic()} tone="accent">
                    ▶ Cinematic
                  </HudButton>
                )}
                <HudButton onClick={() => engine.selectAny()}>Pick a timeline</HudButton>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {!live && graphics.ready && (
        <p className="meta-label absolute bottom-4 left-[var(--gutter)] text-fg-muted">
          {status} · the network at T+{CINEMATIC_END}, drawn from the same simulation
        </p>
      )}
    </main>
  );
}
