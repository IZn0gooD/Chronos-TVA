import { describe, expect, it } from "vitest";
import { POINTS, sample } from "@/lib/multiverse/curves";
import {
  CINEMATIC_END,
  COLLAPSE,
  LOOM,
  MultiverseSimulation,
  PHASES,
  phaseAt,
  progressOf,
  PULSE_SPEED,
  TICK,
  type Timeline,
} from "@/lib/multiverse/simulation";

/** A comparable fingerprint of the whole network. */
function fingerprint(sim: MultiverseSimulation) {
  return [...sim.timelines.values()].map((tl) => [tl.id, tl.slot, tl.kind, tl.parentId, tl.birthTime.toFixed(4), tl.points[POINTS * 3 - 1].toFixed(4), tl.collapseAt]);
}

describe("multiverse simulation", () => {
  it("starts with the loom: eighteen fabric threads and the sacred line", () => {
    const sim = new MultiverseSimulation({ seed: 7, capacity: 512 });
    const kinds = [...sim.timelines.values()].map((t) => t.kind);
    expect(kinds.filter((k) => k === "fabric")).toHaveLength(18);
    expect(kinds.filter((k) => k === "root")).toHaveLength(1);
    const root = sim.get(sim.rootId)!;
    expect(sample(root.points, 0)).toEqual(LOOM.map((v) => expect.closeTo(v, 5)));
  });

  it("is deterministic: same seed, same network", () => {
    const a = new MultiverseSimulation({ seed: 42, capacity: 1024 });
    const b = new MultiverseSimulation({ seed: 42, capacity: 1024 });
    a.advance(18);
    b.advance(18);
    expect(fingerprint(a)).toEqual(fingerprint(b));
    const c = new MultiverseSimulation({ seed: 43, capacity: 1024 });
    c.advance(18);
    expect(fingerprint(c)).not.toEqual(fingerprint(a));
  });

  it("does not depend on the frame rate: many small advances equal one big one", () => {
    const a = new MultiverseSimulation({ seed: 5, capacity: 1024 });
    const b = new MultiverseSimulation({ seed: 5, capacity: 1024 });
    for (let t = 0; t <= 16; t += 1 / 144) a.advance(t);
    a.advance(16);
    b.advance(16);
    expect(fingerprint(a)).toEqual(fingerprint(b));
  });

  it("seeks backward by replaying the same history", () => {
    const sim = new MultiverseSimulation({ seed: 11, capacity: 1024 });
    sim.advance(12);
    const at12 = fingerprint(sim);
    sim.advance(20);
    sim.seek(12);
    expect(fingerprint(sim)).toEqual(at12);
  });

  it("replays the reader's commands at the same tick after a seek", () => {
    const sim = new MultiverseSimulation({ seed: 3, capacity: 1024 });
    sim.advance(10);
    const parent = [...sim.timelines.values()].find((t) => t.kind === "branch" && progressOf(t, sim.time) > 0.5)!;
    sim.command({ type: "branch", parentId: parent.id });
    sim.advance(11);
    const after = fingerprint(sim);
    expect(sim.feed.some((e) => e.type === "birth" && e.byReader && e.parentId === parent.id)).toBe(true);
    sim.seek(2);
    sim.advance(11);
    expect(fingerprint(sim)).toEqual(after);
  });

  it("expands from one line to a large network during the cinematic, within capacity", () => {
    const sim = new MultiverseSimulation({ seed: 1962, capacity: 2048 });
    sim.advance(4);
    const atAwakening = sim.liveCount;
    sim.advance(9);
    const atDivergence = sim.liveCount;
    sim.advance(CINEMATIC_END);
    expect(atAwakening).toBe(19);
    expect(atDivergence).toBeGreaterThan(atAwakening + 20);
    expect(sim.liveCount).toBeGreaterThan(800);
    expect(sim.stats.woven).toBeGreaterThan(5);
    sim.advance(80);
    expect(sim.liveCount).toBeLessThanOrEqual(2048);
    expect(sim.stats.pruned).toBeGreaterThan(0);
  });

  it("keeps every branch attached to its parent and within its depth", () => {
    const sim = new MultiverseSimulation({ seed: 9, capacity: 1024 });
    sim.advance(20);
    for (const tl of sim.timelines.values()) {
      if (tl.kind !== "branch") continue;
      const parent = sim.get(tl.parentId);
      if (!parent) continue;
      const a = sample(parent.points, tl.branchAt);
      const b = sample(tl.points, 0);
      expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeLessThan(1e-3);
      expect(tl.depth).toBe(parent.depth + 1);
      expect(parent.children).toContain(tl.id);
    }
  });

  it("weaves bridge two trunks without merging their lineages", () => {
    const sim = new MultiverseSimulation({ seed: 1962, capacity: 2048 });
    sim.advance(20);
    const weaves = [...sim.timelines.values()].filter((t) => t.kind === "weave");
    expect(weaves.length).toBeGreaterThan(0);
    for (const w of weaves) {
      const [a, b] = w.weave!;
      expect(w.parentId).toBe(a);
      const ta = sim.get(a);
      const tb = sim.get(b);
      if (ta && tb) expect(ta.trunk).not.toBe(tb.trunk);
      if (tb) expect(tb.parentId).not.toBe(w.id);
    }
  });

  it("propagates a pulse into children when it reaches their departure point", () => {
    const sim = new MultiverseSimulation({ seed: 21, capacity: 1024 });
    sim.advance(14);
    const parent = [...sim.timelines.values()].find((t) => t.kind === "branch" && t.children.length > 0)!;
    const child = sim.get(parent.children[0])!;
    const t0 = sim.time;
    sim.launchPulse(parent.id, t0, 1, 0);
    const parentStart = parent.pulses[parent.nextPulse === 0 ? 2 : 0];
    expect(parentStart).toBeCloseTo(t0, 5);
    // The slot written last is the one before `nextPulse`.
    const childStart = child.pulses[child.nextPulse === 0 ? 2 : 0];
    expect(childStart).toBeCloseTo(t0 + (child.branchAt * parent.length) / PULSE_SPEED, 4);
  });

  it("prunes a timeline with its descendants, then frees their slots", () => {
    const sim = new MultiverseSimulation({ seed: 33, capacity: 1024 });
    sim.advance(16);
    const target = [...sim.timelines.values()].find((t) => t.kind === "branch" && t.depth >= 1 && t.children.length > 0) as Timeline;
    const family = [target.id, ...target.children];
    const free = sim.capacity - sim.liveCount;
    sim.command({ type: "collapse", id: target.id });
    sim.advance(sim.time + TICK);
    expect(sim.isCollapsing(target.id)).toBe(true);
    for (const id of target.children) expect(sim.get(id)!.collapseAt).toBeGreaterThan(target.collapseAt);
    sim.advance(sim.time + COLLAPSE.remove + 2);
    for (const id of family) expect(sim.get(id)).toBeUndefined();
    expect(sim.capacity - sim.liveCount).toBeGreaterThanOrEqual(free - 400);
  });

  it("names its phases on the cinematic's clock", () => {
    expect(phaseAt(0).name).toBe("Awakening");
    expect(phaseAt(12).name).toBe("Expansion");
    expect(phaseAt(30).name).toBe(PHASES.at(-1)!.name);
  });

  it("replays 24 simulated seconds fast enough to scrub", () => {
    const sim = new MultiverseSimulation({ seed: 1962, capacity: 2048 });
    const t0 = performance.now();
    sim.seek(CINEMATIC_END);
    const ms = performance.now() - t0;
    expect(ms).toBeLessThan(400);
  });
});

describe("multiverse cinematic (Theatre.js state)", async () => {
  const { readFileSync } = await import("node:fs");
  const path = await import("node:path");
  const { buildMultiverseState, finalPose, LENGTH } = await import("../scripts/theatre-multiverse.mjs");
  const state = buildMultiverseState();

  it("is what data/theatre/multiverse.json holds, and ends on multiverse-pose.json", () => {
    const onDisk = JSON.parse(readFileSync(path.resolve(process.cwd(), "data/theatre/multiverse.json"), "utf8"));
    expect(onDisk).toEqual(state);
    const pose = JSON.parse(readFileSync(path.resolve(process.cwd(), "data/theatre/multiverse-pose.json"), "utf8"));
    expect(pose).toEqual(finalPose());
  });

  it("lasts exactly as long as the simulation's cinematic, with sorted keyframes", () => {
    expect(LENGTH).toBe(CINEMATIC_END);
    const sheet = Object.values(state.sheetsById)[0];
    expect(sheet.sequence.length).toBe(CINEMATIC_END);
    for (const object of Object.values(sheet.sequence.tracksByObject)) {
      for (const track of Object.values(object.trackData)) {
        const positions = track.keyframes.map((k) => k.position);
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
        expect(positions.at(-1)).toBeLessThanOrEqual(CINEMATIC_END);
      }
    }
  });

  it("fades the title in only at the revelation", () => {
    const pose = finalPose();
    expect(pose.world.title).toBe(1);
    expect(phaseAt(21).name).toBe("Revelation");
  });
});

describe("perpetual evolution (after the cinematic)", () => {
  it("draws an endless sequence of eras from the seed: never the same kind twice in a row, no period", () => {
    const a = new MultiverseSimulation({ seed: 1962, capacity: 256 });
    const b = new MultiverseSimulation({ seed: 1962, capacity: 256 });
    const names: string[] = [];
    let era = a.eraAt(CINEMATIC_END)!;
    expect(["Bloom", "Drift", "Nexus"]).toContain(era.name);
    for (let i = 0; i < 60; i++) {
      const twin = b.eraAt(era.start)!;
      expect(twin.name).toBe(era.name);
      expect(era.end - era.start).toBeGreaterThanOrEqual(18);
      expect(era.end - era.start).toBeLessThanOrEqual(42);
      names.push(era.name);
      era = a.eraAt(era.end)!;
    }
    for (let i = 1; i < names.length; i++) expect(names[i]).not.toBe(names[i - 1]);
    for (let p = 1; p <= 20; p++) expect(names.some((n, i) => i + p < names.length && names[i + p] !== n)).toBe(true);
  });

  it("keeps growing, pruning and reshaping for thirty simulated minutes, within capacity", () => {
    const sim = new MultiverseSimulation({ seed: 1962, capacity: 2048 });
    const t0 = performance.now();
    sim.advance(60);
    const trunksAt60 = new Set(sim.get(sim.rootId)!.children);
    let born = sim.stats.born;
    for (let t = 180; t <= 600; t += 120) {
      sim.advance(t);
      expect(sim.stats.born - born).toBeGreaterThan(1000);
      expect(sim.liveCount).toBeLessThanOrEqual(2048);
      born = sim.stats.born;
    }
    const survivorsAt = () => sim.get(sim.rootId)!.children.filter((id) => trunksAt60.has(id)).length;
    // The overall shape turns over: some trunks replaced within ten minutes, most within thirty.
    expect(survivorsAt()).toBeLessThanOrEqual(trunksAt60.size - 4);
    expect(sim.feed.some((e) => e.type === "era")).toBe(true);
    sim.advance(1800);
    expect(survivorsAt()).toBeLessThan(trunksAt60.size / 3);
    expect(sim.liveCount).toBeLessThanOrEqual(2048);
    expect(performance.now() - t0).toBeLessThan(4000);
  });
});
