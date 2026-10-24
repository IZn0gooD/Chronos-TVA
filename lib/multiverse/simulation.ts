/**
 * The multiverse as data: a directed graph of timelines that are born,
 * grow, branch, carry pulses of energy, weave into one another and are
 * pruned. No React, no three.js: this module runs in Node (tests, the
 * server-rendered plate) as well as in the browser.
 *
 * Determinism: the simulation advances in fixed ticks of simulated time,
 * draws every random number from one seeded stream, and builds each curve
 * from a per-timeline seed. Its state is therefore a pure function of
 * (seed, capacity, simulated time, reader commands), whatever the frame
 * rate: `seek(t)` replays the same history from the origin, which is what
 * lets Theatre.js Studio scrub the cinematic and see the same network.
 *
 * The program (how fast realities are born, when they weave, when the
 * authority prunes) is a function of simulated time, written to match the
 * five movements of the cinematic; after 24 s the network lives on in a
 * steady state, renewing itself within its capacity.
 */
import { add, buildCurve, cross, dot, length, normalize, perpendicular, POINTS, sample, scale, sub, type CurveSpec, type Vec3 } from "./curves";
import { hash32, mulberry32 } from "./random";

/** Fixed simulation step, in simulated seconds. */
export const TICK = 1 / 30;
/** Where every timeline is woven from: the origin of the sacred line. */
export const LOOM: Vec3 = [-30, 0, 0];
/** Pulse speed along a filament, in world units per simulated second. */
export const PULSE_SPEED = 16;
/** Seconds after `collapseAt`: unstable until `unstable`, dissolving until `dissolve`, gone at `remove`. */
export const COLLAPSE = { unstable: 1.2, dissolve: 2.9, remove: 3.1 } as const;
/** Duration of the cinematic, in simulated seconds. */
export const CINEMATIC_END = 24;
/** Growth speed of a filament, world units per simulated second. */
const GROWTH_SPEED = 9;
/** Base length of a branch by depth. */
const BASE_LENGTH = [64, 22, 15, 10, 7, 5.5, 4.5, 4];
const FABRIC_COUNT = 18;
const MAX_CHILDREN_ROOT = 48;
/** Trunks alive at once after the cinematic: a lower ceiling, so new trunks come as old ones die and the shape keeps turning over. */
const PERPETUAL_TRUNKS = 36;
const trunkCap = (t: number) => (t < CINEMATIC_END ? MAX_CHILDREN_ROOT : PERPETUAL_TRUNKS);
const MAX_CHILDREN = 5;
const FEED_LENGTH = 40;

export type TimelineKind = "fabric" | "root" | "branch" | "weave";
/** Codes written into the GPU state texture. */
export const KIND_CODE: Record<TimelineKind, number> = { fabric: 0, branch: 1, weave: 2, root: 3 };

export interface Timeline {
  /** Logical id, never reused. */
  id: number;
  /** GPU slot, reused after a timeline is removed. */
  slot: number;
  kind: TimelineKind;
  parentId: number | null;
  /** First-generation ancestor (the depth-1 branch this one descends from), or -1. */
  trunk: number;
  depth: number;
  seed: number;
  /** Where it leaves its parent, as u ∈ [0, 1] along the parent. */
  branchAt: number;
  birthTime: number;
  /** Seconds to grow from 0 to its full length. */
  growth: number;
  length: number;
  energy: number;
  stability: number;
  /** 0..1, compared with the visible density: low ranks stay visible longest. */
  rank: number;
  /** -1..1, a small shift of tint within the timeline's family. */
  hue: number;
  children: number[];
  /** Weaves that end on this timeline (the ones that start on it are among its children). */
  weaveLinks: number[];
  weave: [number, number] | null;
  collapseAt: number;
  /** Two pulse slots: [startA, energyA, startB, energyB]; start = time the pulse passes u = 0. */
  pulses: [number, number, number, number];
  nextPulse: 0 | 1;
  highlight: boolean;
  points: Float32Array;
  tangents: Float32Array;
}

export type MultiverseEvent =
  | { type: "era"; time: number; index: number; name: string }
  | { type: "birth"; time: number; id: number; parentId: number | null; depth: number; byReader: boolean }
  | { type: "pulse"; time: number; id: number; byReader: boolean }
  | { type: "collapse"; time: number; id: number; descendants: number; byReader: boolean }
  | { type: "weave"; time: number; id: number; a: number; b: number };

export type ReaderCommand = { type: "pulse"; id: number } | { type: "branch"; parentId: number } | { type: "collapse"; id: number };

export interface Phase {
  name: string;
  start: number;
  /** One line for the HUD. */
  note: string;
}

/** The five movements of the cinematic, then the living network. */
export const PHASES: readonly Phase[] = [
  { name: "Awakening", start: 0, note: "A single line crosses the void, fed by the loom." },
  { name: "Divergence", start: 4, note: "Realities peel away from the sacred line." },
  { name: "Expansion", start: 9, note: "Branches branch. The field opens in every direction." },
  { name: "Weave", start: 15, note: "Distant timelines meet and braid; light runs through them." },
  { name: "Revelation", start: 20, note: "The whole network, observed at once." },
  { name: "Living network", start: CINEMATIC_END, note: "It renews itself: births, pulses, prunings." },
];

export function phaseAt(t: number): Phase {
  let current = PHASES[0];
  for (const p of PHASES) if (t >= p.start) current = p;
  return current;
}

/** Births per simulated second. */
export function spawnRate(t: number): number {
  if (t < 4) return 0;
  if (t < 9) return 2 + ((t - 4) / 5) * 14;
  if (t < 15) {
    const k = (t - 9) / 6;
    return 16 + Math.sin(k * Math.PI) * 150 + k * 24;
  }
  if (t < 20) return 40;
  if (t < CINEMATIC_END) return 40 - ((t - 20) / 4) * 16;
  return 22 + 6 * Math.sin(t * 0.21);
}

/** Deepest generation allowed to be born at time t. */
export function maxDepthAt(t: number): number {
  return t < 9 ? 2 : t < 12 ? 4 : 7;
}

/** Realities peeling directly off the sacred line, per simulated second: each one starts a new trunk. */
export function divergenceRate(t: number): number {
  if (t < 4) return 0;
  if (t < 9) return 2.4;
  if (t < 15) return 1.5;
  if (t < CINEMATIC_END) return 0.8;
  return 0.3;
}

/** Weaves per simulated second. */
export function weaveRate(t: number): number {
  if (t >= 15 && t < 20) return 4;
  if (t >= CINEMATIC_END) return 0.6;
  if (t >= 9) return 0.4;
  return 0;
}

/** Spontaneous collapses (unstable realities) per simulated second. */
export function collapseRate(t: number): number {
  if (t >= 20 && t < CINEMATIC_END) return 0.8;
  if (t >= CINEMATIC_END) return 0.5;
  return 0;
}

// ─── perpetual evolution ─────────────────────────────────────────────────────
//
// After the cinematic, the network does not settle into a steady state and
// nothing ever replays: it lives through an endless sequence of eras. Each
// era is drawn from (seed, era index) alone: its kind (never the same twice
// in a row), its length (18–42 s), its rates, and for a drift its wind. The
// sequence is deterministic but has no period. An era can open with an
// event: a whole trunk pruned, a new trunk erupting from the sacred line, a
// trunk set to flower. Together with the turnover at capacity, the network's
// overall shape keeps changing: trunks die, others grow elsewhere, growth
// leans one way then another.

interface EraKind {
  name: string;
  note: string;
  /** Relative chance of being drawn. */
  weight: number;
  spawn: [number, number];
  weave: number;
  collapse: number;
  diverge: number;
  /** Seconds between pulses sent from the loom. */
  pulseEvery: number;
  drift?: boolean;
  prune?: boolean;
  nexus?: boolean;
  bloom?: boolean;
}

const ERA_KINDS: readonly EraKind[] = [
  { name: "Bloom", note: "One trunk flowers: its fronts branch again and again.", weight: 3, spawn: [40, 70], weave: 0.4, collapse: 0.2, diverge: 0.3, pulseEvery: 2.6, bloom: true },
  { name: "Drift", note: "Growth leans one way; the network changes shape.", weight: 3, spawn: [20, 34], weave: 0.5, collapse: 0.3, diverge: 0.5, pulseEvery: 3, drift: true },
  { name: "Weave storm", note: "Distant trunks reach for each other and braid.", weight: 2, spawn: [12, 20], weave: 4, collapse: 0.2, diverge: 0.2, pulseEvery: 2.2 },
  { name: "Pruning", note: "The authority cuts a whole trunk; its realities go dark.", weight: 2, spawn: [10, 16], weave: 0.2, collapse: 1.4, diverge: 0.2, pulseEvery: 3.4, prune: true },
  { name: "Nexus", note: "A new reality erupts from the sacred line and spreads.", weight: 2, spawn: [30, 50], weave: 0.5, collapse: 0.3, diverge: 0.8, pulseEvery: 2.4, nexus: true },
  { name: "Calm", note: "Few births. Pulses carry the light along every thread.", weight: 2, spawn: [6, 11], weave: 0.3, collapse: 0.1, diverge: 0.15, pulseEvery: 1.3 },
];

export interface Era {
  index: number;
  name: string;
  note: string;
  start: number;
  end: number;
  spawn: number;
  weave: number;
  collapse: number;
  diverge: number;
  pulseEvery: number;
  wind: Vec3 | null;
  prune: boolean;
  nexus: boolean;
  bloom: boolean;
}

/** The era that follows `prev` (null for the first one, starting when the cinematic ends). Pure: (seed, index) only. */
export function nextEra(seed: number, prev: Era | null): Era {
  const index = prev ? prev.index + 1 : 0;
  const r = mulberry32(hash32(seed, index, 0x0e7a));
  // The first era after the revelation always grows (never opens on a pruning); after that, anything but a repeat.
  const pool = ERA_KINDS.filter((k) => (prev ? k.name !== prev.name : k.bloom || k.drift || k.nexus));
  let pickW = r() * pool.reduce((s, k) => s + k.weight, 0);
  let kind = pool[pool.length - 1];
  for (const k of pool) {
    pickW -= k.weight;
    if (pickW <= 0) {
      kind = k;
      break;
    }
  }
  const start = prev ? prev.end : CINEMATIC_END;
  const angle = r() * Math.PI * 2;
  return {
    index,
    name: kind.name,
    note: kind.note,
    start,
    end: start + 18 + r() * 24,
    spawn: kind.spawn[0] + r() * (kind.spawn[1] - kind.spawn[0]),
    weave: kind.weave,
    collapse: kind.collapse,
    diverge: kind.diverge,
    pulseEvery: kind.pulseEvery,
    wind: kind.drift ? normalize([0.25 * (r() * 2 - 1), Math.cos(angle), Math.sin(angle)]) : null,
    prune: !!kind.prune,
    nexus: !!kind.nexus,
    bloom: !!kind.bloom,
  };
}

export function progressOf(tl: Timeline, t: number): number {
  return Math.min(1, Math.max(0, (t - tl.birthTime) / tl.growth));
}

export interface SimulationOptions {
  seed?: number;
  /** GPU slots: the most timelines alive at once. */
  capacity?: number;
}

export class MultiverseSimulation {
  readonly seed: number;
  readonly capacity: number;
  time = 0;
  tickIndex = 0;
  readonly timelines = new Map<number, Timeline>();
  readonly stats = { born: 0, pruned: 0, woven: 0, pulses: 0, deferred: 0 };
  /** Increments whenever anything a renderer shows changes. */
  version = 0;
  /** Slots whose curve changed since the renderer last read them. */
  readonly dirtySlots = new Set<number>();
  /** True after a reset: every slot must be rewritten. */
  fullRewrite = true;
  /** Recent notable events, newest last. */
  readonly feed: MultiverseEvent[] = [];
  rootId = -1;
  /** Highest slot index currently in use (slots are handed out lowest first), -1 when empty. */
  highestSlot = -1;

  private rng: () => number = Math.random;
  private slots: (Timeline | null)[] = [];
  private freeSlots: number[] = [];
  private liveIds: number[] = [];
  private liveIndex = new Map<number, number>();
  private collapsing = new Set<number>();
  private fabricIds: number[] = [];
  private nextId = 0;
  private nextLoomPulse = 2;
  private eras: Era[] = [];
  private eraOpened = -1;
  /** Recent births: growth continues at the fronts, which is what makes growth visible. */
  private recent: number[] = [];
  /** The trunk an era favours (bloom, nexus) and the members it has so far. */
  private focus: number[] = [];
  private focusTrunk = -1;
  private readerLog: Array<ReaderCommand & { tick: number }> = [];
  private readerCursor = 0;

  constructor(options: SimulationOptions = {}) {
    this.seed = (options.seed ?? 1962) >>> 0;
    this.capacity = Math.max(64, options.capacity ?? 2048);
    this.reset();
  }

  /** Back to the origin: the loom, the fabric threads and the sacred line, not yet grown. Reader commands are kept for replay. */
  reset(): void {
    this.rng = mulberry32(this.seed);
    this.time = 0;
    this.tickIndex = 0;
    this.timelines.clear();
    this.slots = new Array(this.capacity).fill(null);
    this.freeSlots = Array.from({ length: this.capacity }, (_, i) => this.capacity - 1 - i);
    this.liveIds = [];
    this.liveIndex.clear();
    this.collapsing.clear();
    this.fabricIds = [];
    this.highestSlot = -1;
    this.nextId = 0;
    this.nextLoomPulse = 2;
    this.eras = [];
    this.eraOpened = -1;
    this.recent = [];
    this.focus = [];
    this.focusTrunk = -1;
    this.readerCursor = 0;
    this.feed.length = 0;
    Object.assign(this.stats, { born: 0, pruned: 0, woven: 0, pulses: 0, deferred: 0 });
    this.dirtySlots.clear();
    this.fullRewrite = true;
    this.createFabric();
    this.createRoot();
    this.version++;
  }

  /** Forgets the reader's commands (a fresh replay of the program alone). */
  clearReaderLog(): void {
    this.readerLog = [];
    this.readerCursor = 0;
  }

  /** Advances in whole ticks up to `target` (simulated seconds). */
  advance(target: number): void {
    while (this.time + TICK <= target + 1e-9) this.tick();
  }

  /** Jumps to `target`: forward by advancing, backward by replaying from the origin. */
  seek(target: number): void {
    if (target < this.time - 1e-6) this.reset();
    this.advance(target);
  }

  /** Queues a reader command for the next tick; it is replayed identically after a seek. */
  command(cmd: ReaderCommand): void {
    this.readerLog.push({ ...cmd, tick: this.tickIndex });
  }

  get(id: number | null | undefined): Timeline | undefined {
    return id === null || id === undefined ? undefined : this.timelines.get(id);
  }

  slotTimeline(slot: number): Timeline | null {
    return this.slots[slot] ?? null;
  }

  get liveCount(): number {
    return this.liveIds.length;
  }

  /** Ids currently alive (not yet removed), in no meaningful order. */
  get live(): readonly number[] {
    return this.liveIds;
  }

  isCollapsing(id: number): boolean {
    return this.collapsing.has(id);
  }

  /** The era in force at `t` (null during the cinematic). Eras are generated as time reaches them. */
  eraAt(t: number): Era | null {
    if (t < CINEMATIC_END) return null;
    if (!this.eras.length) this.eras.push(nextEra(this.seed, null));
    while (this.eras[this.eras.length - 1].end <= t) this.eras.push(nextEra(this.seed, this.eras[this.eras.length - 1]));
    if (this.eras.length > 64) this.eras.splice(0, this.eras.length - 64);
    for (let i = this.eras.length - 1; i >= 0; i--) if (this.eras[i].start <= t) return this.eras[i];
    return this.eras[0];
  }

  /** Ids of the most recent births, newest last (for the camera's autopilot). */
  get recentBirths(): readonly number[] {
    return this.recent;
  }

  /** Marks the selected timeline and its ancestors; clears any previous lineage. */
  setSelection(id: number | null): void {
    for (const tl of this.timelines.values()) tl.highlight = false;
    let cur = this.get(id);
    while (cur) {
      cur.highlight = true;
      cur = this.get(cur.parentId);
    }
    this.version++;
  }

  /** Number of descendants still alive. */
  descendants(id: number): number {
    const tl = this.get(id);
    if (!tl) return 0;
    let n = 0;
    for (const c of tl.children) n += 1 + this.descendants(c);
    return n;
  }

  // ─── the tick ────────────────────────────────────────────────────────────

  private tick(): void {
    const t = this.time;
    while (this.readerCursor < this.readerLog.length && this.readerLog[this.readerCursor].tick <= this.tickIndex) {
      this.applyCommand(this.readerLog[this.readerCursor], t);
      this.readerCursor++;
    }

    // The cinematic follows its written program; afterwards, the era in force sets the pace.
    const era = this.eraAt(t);
    if (era && era.index > this.eraOpened) this.openEra(era, t);

    const expected = (era ? era.spawn : spawnRate(t)) * TICK;
    let births = Math.floor(expected);
    if (this.rng() < expected - births) births++;
    for (let i = 0; i < births; i++) this.trySpawn(t);
    if (this.rng() < (era ? era.diverge : divergenceRate(t)) * TICK) this.tryDiverge(t);

    if (this.rng() < (era ? era.weave : weaveRate(t)) * TICK) this.tryWeave(t);
    if (this.rng() < (era ? era.collapse : collapseRate(t)) * TICK) this.tryUnstableCollapse(t);
    // Turnover at capacity: the busier the era, the more the authority prunes to make room.
    const used = this.capacity - this.freeSlots.length;
    for (let k = 0; k < 3 && used > this.capacity * 0.86 && this.collapsing.size < this.capacity * 0.1; k++) {
      if (!this.tryPressurePrune(t)) break;
      if (!era || era.spawn < 30) break;
    }

    if (t >= this.nextLoomPulse && this.rootId >= 0) {
      this.launchPulse(this.rootId, t, 1.1, 0);
      this.nextLoomPulse += era ? era.pulseEvery : 2.2;
    }
    if (t > 1 && this.fabricIds.length && this.rng() < 1.2 * TICK) {
      const id = this.fabricIds[Math.floor(this.rng() * this.fabricIds.length)];
      this.launchPulse(id, t, 0.8, 0);
    }

    for (const id of [...this.collapsing]) {
      const tl = this.timelines.get(id);
      if (tl && t >= tl.collapseAt + COLLAPSE.remove) this.remove(tl);
    }

    this.tickIndex++;
    this.time = this.tickIndex * TICK;
  }

  private applyCommand(cmd: ReaderCommand, t: number): void {
    if (cmd.type === "pulse") {
      if (this.launchPulse(cmd.id, t, 1.4, 0)) this.pushFeed({ type: "pulse", time: t, id: cmd.id, byReader: true });
    } else if (cmd.type === "branch") {
      const parent = this.get(cmd.parentId);
      if (parent && (parent.kind === "root" || parent.kind === "branch") && !this.collapsing.has(parent.id)) {
        const hi = Math.max(0.15, Math.min(progressOf(parent, t), 0.97));
        const child = this.spawnBranch(parent, hi - this.rng() * Math.min(0.3, hi - 0.1), t);
        if (child) this.pushFeed({ type: "birth", time: t, id: child.id, parentId: parent.id, depth: child.depth, byReader: true });
      }
    } else if (cmd.type === "collapse") {
      const tl = this.get(cmd.id);
      if (tl && tl.kind !== "root" && !this.collapsing.has(tl.id)) {
        this.pushFeed({ type: "collapse", time: t, id: tl.id, descendants: this.descendants(tl.id), byReader: true });
        this.collapse(tl, t, 0);
      }
    }
  }

  // ─── births ──────────────────────────────────────────────────────────────

  private allocate(kind: TimelineKind, parent: Timeline | null, t: number): Timeline | null {
    const slot = this.freeSlots.pop();
    if (slot === undefined) {
      this.stats.deferred++;
      return null;
    }
    const id = this.nextId++;
    const tl: Timeline = {
      id,
      slot,
      kind,
      parentId: parent ? parent.id : null,
      trunk: parent ? (parent.depth === 0 ? id : parent.trunk) : -1,
      depth: parent ? parent.depth + 1 : 0,
      seed: hash32(this.seed, id, 0x51ed),
      branchAt: 0,
      birthTime: t,
      growth: 1,
      length: 1,
      energy: 1,
      stability: 1,
      rank: 0,
      hue: 0,
      children: [],
      weaveLinks: [],
      weave: null,
      collapseAt: Infinity,
      pulses: [-1e6, 0, -1e6, 0],
      nextPulse: 0,
      highlight: false,
      points: new Float32Array(POINTS * 3),
      tangents: new Float32Array(POINTS * 3),
    };
    this.slots[slot] = tl;
    if (slot > this.highestSlot) this.highestSlot = slot;
    this.timelines.set(id, tl);
    this.liveIndex.set(id, this.liveIds.length);
    this.liveIds.push(id);
    if (parent) parent.children.push(id);
    this.dirtySlots.add(slot);
    this.version++;
    return tl;
  }

  private finish(tl: Timeline, spec: CurveSpec, speed: number): void {
    tl.length = buildCurve(spec, tl.points, tl.tangents);
    tl.growth = Math.max(0.6, tl.length / speed);
    this.stats.born++;
  }

  private createFabric(): void {
    for (let i = 0; i < FABRIC_COUNT; i++) {
      const tl = this.allocate("fabric", null, 0.1 + i * 0.12);
      if (!tl) return;
      const r = mulberry32(tl.seed);
      const around = (i / FABRIC_COUNT) * Math.PI * 2 + r() * 0.3;
      const radius = 18 + r() * 24;
      const back = 12 + r() * 34;
      const start: Vec3 = [LOOM[0] - back, Math.cos(around) * radius, Math.sin(around) * radius];
      const inward = normalize(sub(LOOM, start));
      const swirl = normalize(cross([1, 0, 0], inward));
      tl.energy = 0.35 + r() * 0.2;
      tl.rank = 0;
      tl.hue = r() * 2 - 1;
      this.finish(
        tl,
        {
          start,
          startDir: normalize(add(inward, scale(swirl, 0.6))),
          end: LOOM,
          endDir: normalize(add([1, 0, 0], scale(inward, 0.35))),
          startHandle: 0.4,
          endHandle: 0.45,
          wobble: 1.2 + r() * 2.2,
          frequency: 2 + r() * 3,
          phase: r() * Math.PI * 2,
          axis: swirl,
        },
        14,
      );
      this.fabricIds.push(tl.id);
    }
  }

  private createRoot(): void {
    const tl = this.allocate("root", null, 0.5);
    if (!tl) return;
    tl.energy = 1;
    tl.rank = 0;
    this.rootId = tl.id;
    this.finish(
      tl,
      {
        start: LOOM,
        startDir: normalize([1, 0.06, 0.03]),
        end: [34, 0.8, -0.6],
        endDir: normalize([1, -0.03, 0]),
        wobble: 1.4,
        frequency: 2.2 * Math.PI,
        phase: 0.4,
        axis: [0, 1, 0],
      },
      8,
    );
  }

  /** What an era does as it opens: prune a whole trunk, erupt a new one, or set one to flower. */
  private openEra(era: Era, t: number): void {
    this.eraOpened = era.index;
    this.focus = [];
    this.focusTrunk = -1;
    this.pushFeed({ type: "era", time: t, index: era.index, name: era.name });
    const root = this.get(this.rootId);
    if (!root) return;
    const trunks = root.children
      .map((id) => this.timelines.get(id))
      .filter((tl): tl is Timeline => !!tl && tl.kind === "branch" && !this.collapsing.has(tl.id));
    const oldestFamilies = trunks.filter((tl) => this.descendants(tl.id) >= 8).sort((a, b) => a.birthTime - b.birthTime);
    const cut = (tl: Timeline) => {
      this.pushFeed({ type: "collapse", time: t, id: tl.id, descendants: this.descendants(tl.id), byReader: false });
      this.collapse(tl, t, 0);
    };
    if (era.prune) {
      // The two oldest trunks with a real family go, with everything that grew from them.
      oldestFamilies.slice(0, 2).forEach(cut);
    } else if (era.nexus) {
      // On a full sacred line, the new reality replaces the oldest one.
      if (trunks.length >= trunkCap(t) && oldestFamilies[0]) cut(oldestFamilies[0]);
      const u = 0.15 + this.rng() * 0.8;
      const trunk = this.spawnBranch(root, u, t);
      if (trunk) {
        trunk.energy = 1;
        this.focusTrunk = trunk.id;
        this.focus = [trunk.id];
        this.pushFeed({ type: "birth", time: t, id: trunk.id, parentId: root.id, depth: 1, byReader: false });
        this.launchPulse(root.id, t, 1.3, Math.max(0, u - 0.2));
      }
    } else if (era.bloom && trunks.length) {
      const trunk = trunks[Math.floor(this.rng() * trunks.length)];
      this.focusTrunk = trunk.id;
      const stack = [trunk.id];
      while (stack.length && this.focus.length < 400) {
        const id = stack.pop()!;
        const tl = this.timelines.get(id);
        if (!tl || tl.kind !== "branch") continue;
        this.focus.push(id);
        stack.push(...tl.children);
      }
      this.launchPulse(trunk.id, t, 1.4, 0);
    }
  }

  /** A random parent candidate: from the era's favoured trunk, from the recent fronts, or from anywhere. */
  private candidate(): Timeline | undefined {
    const r = this.rng();
    const list = this.focus.length && r < 0.45 ? this.focus : this.recent.length && r < 0.8 ? this.recent : this.liveIds;
    return this.timelines.get(list[Math.floor(this.rng() * list.length)]);
  }

  private trySpawn(t: number): void {
    const depthLimit = maxDepthAt(t);
    let best: Timeline | null = null;
    let bestScore = -1;
    for (let attempt = 0; attempt < 10 && this.liveIds.length; attempt++) {
      const tl = this.candidate();
      if (!tl || (tl.kind !== "root" && tl.kind !== "branch")) continue;
      if (tl.depth >= depthLimit || this.collapsing.has(tl.id)) continue;
      const branchKids = tl.children.length;
      if (branchKids >= (tl.kind === "root" ? trunkCap(t) : MAX_CHILDREN)) continue;
      if (progressOf(tl, t) < 0.25) continue;
      const age = t - tl.birthTime;
      const score = tl.energy * (1 + 2 * Math.exp(-age / 6)) / (1 + branchKids * 0.5) * (0.5 + this.rng());
      if (score > bestScore) {
        bestScore = score;
        best = tl;
      }
    }
    if (!best) return;
    const hi = Math.min(progressOf(best, t), 0.96);
    const lo = Math.max(0.1, hi - 0.6);
    const u = lo + (hi - lo) * Math.sqrt(this.rng());
    const child = this.spawnBranch(best, u, t);
    if (child && child.depth <= 1) this.pushFeed({ type: "birth", time: t, id: child.id, parentId: best.id, depth: child.depth, byReader: false });
  }

  /** A new trunk: a reality leaving the sacred line itself, near its growing head. */
  private tryDiverge(t: number): void {
    const root = this.get(this.rootId);
    if (!root || root.children.length >= trunkCap(t)) return;
    const hi = Math.min(progressOf(root, t), 0.96);
    if (hi < 0.12) return;
    const lo = Math.max(0.06, hi - 0.5);
    const child = this.spawnBranch(root, lo + (hi - lo) * Math.sqrt(this.rng()), t);
    if (child) this.pushFeed({ type: "birth", time: t, id: child.id, parentId: root.id, depth: child.depth, byReader: false });
  }

  /** A reality diverging from `parent` at u: inherits the parent's direction, peels outward from the sacred axis, then runs forward again. */
  private spawnBranch(parent: Timeline, u: number, t: number): Timeline | null {
    const tl = this.allocate("branch", parent, t);
    if (!tl) return null;
    const r = mulberry32(tl.seed);
    const start = sample(parent.points, u);
    const fwd = normalize(sample(parent.tangents, u));
    // Outward: away from the sacred axis (x); on the axis itself, any angle around it.
    let radial: Vec3 = [0, start[1], start[2]];
    if (length(radial) < 0.8 || parent.kind === "root") radial = perpendicular(fwd, r() * Math.PI * 2);
    radial = normalize(sub(radial, scale(fwd, dot(radial, fwd))));
    const scatter = perpendicular(fwd, r() * Math.PI * 2);
    let out = normalize(add(scale(radial, 0.7), scale(scatter, 0.45)));
    // A drifting era leans every new branch the same way: over its length, the network's silhouette moves.
    const wind = this.eraAt(t)?.wind;
    if (wind) out = normalize(add(out, scale(normalize(sub(wind, scale(fwd, dot(wind, fwd)))), 0.9)));
    const theta = ((22 + r() * 38) * Math.PI) / 180;
    const dir = normalize(add(scale(fwd, Math.cos(theta)), scale(out, Math.sin(theta))));
    const len = BASE_LENGTH[Math.min(tl.depth, BASE_LENGTH.length - 1)] * (0.7 + r() * 0.6);
    const endDir = normalize(add(scale(fwd, 0.85), scale(out, 0.45)));
    const end = add(add(start, scale(dir, len * 0.6)), scale(endDir, len * 0.45));
    tl.branchAt = u;
    tl.energy = Math.min(1, Math.max(0.3, parent.energy * (0.78 + r() * 0.2)));
    tl.stability = 0.4 + r() * 0.6;
    tl.rank = r();
    tl.hue = r() * 2 - 1;
    this.finish(
      tl,
      {
        start,
        startDir: fwd,
        end,
        endDir,
        startHandle: 0.3,
        endHandle: 0.35,
        wobble: (0.25 + r() * 0.6) * (len / 20),
        frequency: (2 + r() * 3) * Math.PI,
        phase: r() * Math.PI * 2,
        axis: normalize(cross(dir, out)),
      },
      GROWTH_SPEED * (0.75 + r() * 0.5),
    );
    this.recent.push(tl.id);
    if (this.recent.length > 256) this.recent.shift();
    if (this.focusTrunk >= 0 && tl.trunk === this.focusTrunk) this.focus.push(tl.id);
    return tl;
  }

  /** Two timelines from different trunks whose tips have drifted close braid together: a bridge, not a fusion (each keeps its lineage). */
  private tryWeave(t: number): void {
    const pick = () => this.timelines.get(this.liveIds[Math.floor(this.rng() * this.liveIds.length)]);
    const ready = (tl: Timeline | undefined): tl is Timeline =>
      !!tl && tl.kind === "branch" && tl.depth >= 1 && !this.collapsing.has(tl.id) && progressOf(tl, t) >= 0.9;
    let a: Timeline | undefined;
    for (let i = 0; i < 8 && !ready(a); i++) a = pick();
    if (!ready(a)) return;
    const ua = 0.55 + this.rng() * 0.4;
    const pointA = sample(a.points, ua);
    let b: Timeline | null = null;
    let ub = 0.8;
    let bestDist = 14;
    for (let i = 0; i < 48; i++) {
      const c = pick();
      if (!ready(c) || c.id === a.id || c.trunk === a.trunk) continue;
      const u = 0.55 + this.rng() * 0.4;
      const d = length(sub(sample(c.points, u), pointA));
      if (d > 2 && d < bestDist) {
        bestDist = d;
        b = c;
        ub = u;
      }
    }
    if (!b) return;
    const tl = this.allocate("weave", a, t);
    if (!tl) return;
    const r = mulberry32(tl.seed);
    const start = sample(a.points, ua);
    const end = sample(b.points, ub);
    const span = sub(end, start);
    const along = normalize(span);
    const axis = perpendicular(along, r() * Math.PI * 2);
    tl.weave = [a.id, b.id];
    tl.branchAt = ua;
    tl.energy = 1;
    tl.stability = 0.9;
    tl.rank = r() * 0.6;
    tl.hue = r() * 2 - 1;
    this.finish(
      tl,
      {
        start,
        startDir: normalize(add(scale(normalize(sample(a.tangents, ua)), 0.6), scale(along, 0.8))),
        end,
        endDir: normalize(add(scale(along, 0.8), scale(normalize(sample(b.tangents, ub)), 0.4))),
        wobble: 0.55,
        frequency: Math.max(3, length(span) / 2.2) * Math.PI,
        phase: r() * Math.PI * 2,
        axis,
        axis2: normalize(cross(along, axis)),
      },
      12,
    );
    b.weaveLinks.push(tl.id);
    this.stats.woven++;
    this.pushFeed({ type: "weave", time: t, id: tl.id, a: a.id, b: b.id });
    this.launchPulse(a.id, t, 1.2, 0);
    this.launchPulse(b.id, t, 1.2, 0);
  }

  // ─── pulses ──────────────────────────────────────────────────────────────

  /**
   * Sends a pulse along a timeline, passing `fromU` at time `t0`. When it
   * reaches a child's departure point it continues into the child, 20 %
   * weaker, until it fades below 0.15. Children's pulses are scheduled in
   * the future; the shader shows each one when its time comes.
   */
  launchPulse(id: number, t0: number, energy: number, fromU: number): boolean {
    const tl = this.timelines.get(id);
    if (!tl || this.collapsing.has(id)) return false;
    const start = t0 - (fromU * tl.length) / PULSE_SPEED;
    const k = tl.nextPulse * 2;
    tl.pulses[k] = start;
    tl.pulses[k + 1] = energy;
    tl.nextPulse = tl.nextPulse === 0 ? 1 : 0;
    this.stats.pulses++;
    this.version++;
    const next = energy * 0.8;
    if (next >= 0.15) {
      for (const cid of tl.children) {
        const c = this.timelines.get(cid);
        if (c && c.branchAt >= fromU) this.launchPulse(cid, start + (c.branchAt * tl.length) / PULSE_SPEED, next, 0);
      }
    }
    return true;
  }

  // ─── collapses ───────────────────────────────────────────────────────────

  /** A timeline and everything that grew from it destabilise, then dissolve, in a cascade outward. */
  private collapse(tl: Timeline, t: number, delay: number): void {
    if (this.collapsing.has(tl.id)) return;
    tl.collapseAt = t + delay;
    this.collapsing.add(tl.id);
    this.version++;
    for (const cid of tl.children) {
      const c = this.timelines.get(cid);
      if (c) this.collapse(c, t, delay + 0.18);
    }
    for (const wid of tl.weaveLinks) {
      const w = this.timelines.get(wid);
      if (w) this.collapse(w, t, delay + 0.1);
    }
  }

  private tryUnstableCollapse(t: number): void {
    let pickTl: Timeline | null = null;
    for (let i = 0; i < 12 && this.liveIds.length; i++) {
      const tl = this.timelines.get(this.liveIds[Math.floor(this.rng() * this.liveIds.length)]);
      if (!tl || tl.kind !== "branch" || tl.depth < 2 || this.collapsing.has(tl.id) || tl.stability > 0.6) continue;
      if (progressOf(tl, t) < 1) continue;
      pickTl = tl;
      break;
    }
    if (!pickTl) return;
    this.pushFeed({ type: "collapse", time: t, id: pickTl.id, descendants: this.descendants(pickTl.id), byReader: false });
    this.collapse(pickTl, t, 0);
  }

  /** Near capacity, the authority prunes the oldest outlying branch it can find, with all its descendants. */
  private tryPressurePrune(t: number): boolean {
    let oldest: Timeline | null = null;
    for (let i = 0; i < 16 && this.liveIds.length; i++) {
      const tl = this.timelines.get(this.liveIds[Math.floor(this.rng() * this.liveIds.length)]);
      if (!tl || tl.kind !== "branch" || tl.depth < 2 || this.collapsing.has(tl.id) || t - tl.birthTime < 6) continue;
      if (!oldest || tl.birthTime < oldest.birthTime) oldest = tl;
    }
    if (!oldest) return false;
    this.pushFeed({ type: "collapse", time: t, id: oldest.id, descendants: this.descendants(oldest.id), byReader: false });
    this.collapse(oldest, t, 0);
    return true;
  }

  private remove(tl: Timeline): void {
    this.collapsing.delete(tl.id);
    this.timelines.delete(tl.id);
    this.slots[tl.slot] = null;
    this.freeSlots.push(tl.slot);
    // Keep free slots handed out lowest first, so the drawn range stays as short as the live count allows.
    this.freeSlots.sort((a, b) => b - a);
    while (this.highestSlot >= 0 && this.slots[this.highestSlot] === null) this.highestSlot--;
    const idx = this.liveIndex.get(tl.id);
    if (idx !== undefined) {
      const last = this.liveIds.pop()!;
      if (last !== tl.id) {
        this.liveIds[idx] = last;
        this.liveIndex.set(last, idx);
      }
      this.liveIndex.delete(tl.id);
    }
    const parent = this.get(tl.parentId);
    if (parent) parent.children = parent.children.filter((c) => c !== tl.id);
    if (tl.weave) {
      const b = this.get(tl.weave[1]);
      if (b) b.weaveLinks = b.weaveLinks.filter((w) => w !== tl.id);
    }
    this.stats.pruned++;
    this.dirtySlots.add(tl.slot);
    this.version++;
  }

  private pushFeed(e: MultiverseEvent): void {
    this.feed.push(e);
    if (this.feed.length > FEED_LENGTH) this.feed.shift();
  }
}

/** Display name of a timeline: "TL-0421", the root "SL-0", fabric threads "FT-03". */
export function timelineName(tl: Pick<Timeline, "id" | "kind">, fabricIndex?: number): string {
  if (tl.kind === "root") return "SL-0";
  if (tl.kind === "fabric") return `FT-${String(fabricIndex ?? tl.id).padStart(2, "0")}`;
  return `${tl.kind === "weave" ? "WV" : "TL"}-${String(tl.id).padStart(4, "0")}`;
}
