import { BufferAttribute, BufferGeometry, DataTexture, DynamicDrawUsage, FloatType, NearestFilter, RGBAFormat } from "three";
import { POINTS, SEGMENTS, sampleInto } from "@/lib/multiverse/curves";
import { COLLAPSE, KIND_CODE, MultiverseSimulation, progressOf, type Timeline } from "@/lib/multiverse/simulation";
import { mulberry32 } from "@/lib/multiverse/random";

/*
 * The geometry layer: turns the simulation's data into GPU buffers, without
 * one object per timeline. Every timeline owns a fixed slot in three shared
 * structures, allocated once for the whole capacity:
 *   - the filament geometry (one ribbon per slot, 4 vertices per segment);
 *   - the state texture (4 texels per slot, read by every shader);
 *   - the node geometry (one point per slot, at the tip).
 * A birth writes one slot (a partial buffer upload); everything that moves
 * over time is computed by the shaders from the simulated time. The flow
 * particles are the one CPU-animated part: they ride the sampled curves.
 */

const VERTS_PER_SLOT = SEGMENTS * 4;
const NEVER = 1e9;

export class MultiverseRuntime {
  readonly sim: MultiverseSimulation;
  readonly capacity: number;
  readonly filaments = new BufferGeometry();
  readonly nodes = new BufferGeometry();
  readonly state: DataTexture;
  readonly flow: FlowField;
  private readonly positions: Float32Array;
  private readonly tangents: Float32Array;
  private readonly tips: Float32Array;
  private readonly stateData: Float32Array;
  private syncedVersion = -1;

  constructor(options: { seed?: number; capacity: number; particles: number }) {
    this.capacity = options.capacity;
    this.sim = new MultiverseSimulation({ seed: options.seed, capacity: options.capacity });
    const n = this.capacity * VERTS_PER_SLOT;

    this.positions = new Float32Array(n * 3);
    this.tangents = new Float32Array(n * 3);
    const codes = new Float32Array(n);
    const slots = new Float32Array(n);
    const index = new Uint32Array(this.capacity * SEGMENTS * 6);
    for (let s = 0; s < this.capacity; s++) {
      for (let i = 0; i < SEGMENTS; i++) {
        const v = s * VERTS_PER_SLOT + i * 4;
        for (let c = 0; c < 4; c++) {
          codes[v + c] = i * 4 + c;
          slots[v + c] = s;
        }
        const k = (s * SEGMENTS + i) * 6;
        index.set([v, v + 2, v + 1, v + 1, v + 2, v + 3], k);
      }
    }
    const pos = new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage);
    const tan = new BufferAttribute(this.tangents, 3).setUsage(DynamicDrawUsage);
    this.filaments.setAttribute("position", pos);
    this.filaments.setAttribute("aTangent", tan);
    this.filaments.setAttribute("aCode", new BufferAttribute(codes, 1));
    this.filaments.setAttribute("aSlot", new BufferAttribute(slots, 1));
    this.filaments.setIndex(new BufferAttribute(index, 1));

    this.tips = new Float32Array(this.capacity * 3);
    const nodeSlots = new Float32Array(this.capacity);
    for (let s = 0; s < this.capacity; s++) nodeSlots[s] = s;
    this.nodes.setAttribute("position", new BufferAttribute(this.tips, 3).setUsage(DynamicDrawUsage));
    this.nodes.setAttribute("aSlot", new BufferAttribute(nodeSlots, 1));

    this.stateData = new Float32Array(this.capacity * 4 * 4);
    this.state = new DataTexture(this.stateData, this.capacity, 4, RGBAFormat, FloatType);
    this.state.minFilter = NearestFilter;
    this.state.magFilter = NearestFilter;
    this.state.generateMipmaps = false;

    this.flow = new FlowField(options.particles);
    this.sync();
  }

  /** Uploads what changed in the simulation since the last call: new curves, and the state texture if anything moved. */
  sync(): void {
    const sim = this.sim;
    const pos = this.filaments.getAttribute("position") as BufferAttribute;
    const tan = this.filaments.getAttribute("aTangent") as BufferAttribute;
    const tip = this.nodes.getAttribute("position") as BufferAttribute;
    if (sim.fullRewrite) {
      for (let s = 0; s < this.capacity; s++) {
        const tl = sim.slotTimeline(s);
        if (tl) this.writeSlot(tl);
      }
      pos.clearUpdateRanges();
      tan.clearUpdateRanges();
      tip.clearUpdateRanges();
      pos.needsUpdate = tan.needsUpdate = tip.needsUpdate = true;
      sim.fullRewrite = false;
      sim.dirtySlots.clear();
      this.flow.reset();
    } else if (sim.dirtySlots.size) {
      for (const s of sim.dirtySlots) {
        const tl = sim.slotTimeline(s);
        if (!tl) continue;
        this.writeSlot(tl);
        pos.addUpdateRange(s * VERTS_PER_SLOT * 3, VERTS_PER_SLOT * 3);
        tan.addUpdateRange(s * VERTS_PER_SLOT * 3, VERTS_PER_SLOT * 3);
        tip.addUpdateRange(s * 3, 3);
      }
      pos.needsUpdate = tan.needsUpdate = tip.needsUpdate = true;
      sim.dirtySlots.clear();
    }
    if (sim.version !== this.syncedVersion) {
      this.writeState();
      this.syncedVersion = sim.version;
    }
    // Draw only up to the highest slot in use: empty slots cost nothing, even their degenerate triangles.
    const used = sim.highestSlot + 1;
    this.filaments.setDrawRange(0, used * SEGMENTS * 6);
    this.nodes.setDrawRange(0, used);
  }

  private writeSlot(tl: Timeline): void {
    const base = tl.slot * VERTS_PER_SLOT * 3;
    for (let i = 0; i < SEGMENTS; i++) {
      for (let c = 0; c < 4; c++) {
        const p = (i + (c > 1 ? 1 : 0)) * 3;
        const o = base + (i * 4 + c) * 3;
        this.positions[o] = tl.points[p];
        this.positions[o + 1] = tl.points[p + 1];
        this.positions[o + 2] = tl.points[p + 2];
        this.tangents[o] = tl.tangents[p];
        this.tangents[o + 1] = tl.tangents[p + 1];
        this.tangents[o + 2] = tl.tangents[p + 2];
      }
    }
    const last = (POINTS - 1) * 3;
    this.tips.set([tl.points[last], tl.points[last + 1], tl.points[last + 2]], tl.slot * 3);
  }

  private writeState(): void {
    const d = this.stateData;
    const row = this.capacity * 4;
    for (let s = 0; s < this.capacity; s++) {
      const tl = this.sim.slotTimeline(s);
      const o = s * 4;
      if (!tl) {
        d[o] = NEVER;
        d[o + 1] = 1;
        d[row * 3 + o] = NEVER;
        continue;
      }
      d[o] = tl.birthTime;
      d[o + 1] = tl.growth;
      d[o + 2] = tl.length;
      d[o + 3] = tl.depth;
      d[row + o] = tl.energy;
      d[row + o + 1] = tl.stability;
      d[row + o + 2] = tl.seed / 4294967296;
      d[row + o + 3] = KIND_CODE[tl.kind];
      d.set(tl.pulses, row * 2 + o);
      d[row * 3 + o] = Number.isFinite(tl.collapseAt) ? tl.collapseAt : NEVER;
      d[row * 3 + o + 1] = tl.rank;
      d[row * 3 + o + 2] = tl.hue;
      d[row * 3 + o + 3] = tl.highlight ? 1 : 0;
    }
    this.state.needsUpdate = true;
  }

  dispose(): void {
    this.filaments.dispose();
    this.nodes.dispose();
    this.state.dispose();
    this.flow.geometry.dispose();
  }
}

/**
 * The temporal flow: particles riding the timelines from their origin to
 * their growing head, at a speed that follows the timeline's energy and
 * stability. A particle on a timeline that collapses breaks away as an
 * ember and fades. Positions are computed on the CPU from the sampled
 * curves (a few thousand lerps per frame) and uploaded once per frame.
 */
export class FlowField {
  readonly geometry = new BufferGeometry();
  readonly max: number;
  active: number;
  private readonly position: Float32Array;
  private readonly bright: Float32Array;
  private readonly tint: Float32Array;
  private readonly owner: Int32Array;
  private readonly u: Float32Array;
  private readonly speed: Float32Array;
  private readonly velocity: Float32Array;
  private readonly life: Float32Array;
  private readonly rng = mulberry32(0x1962);

  constructor(max: number) {
    this.max = max;
    this.active = max;
    this.position = new Float32Array(max * 3);
    this.bright = new Float32Array(max);
    this.tint = new Float32Array(max);
    this.owner = new Int32Array(max).fill(-1);
    this.u = new Float32Array(max);
    this.speed = new Float32Array(max);
    this.velocity = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    const size = new Float32Array(max);
    for (let i = 0; i < max; i++) size[i] = 22 + this.rng() * 34;
    this.geometry.setAttribute("position", new BufferAttribute(this.position, 3).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute("aBright", new BufferAttribute(this.bright, 1).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute("aTint", new BufferAttribute(this.tint, 1).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute("aSize", new BufferAttribute(size, 1));
  }

  /** Forget every particle (after a seek): they re-attach on the next update. */
  reset(): void {
    this.owner.fill(-1);
    this.life.fill(0);
    this.bright.fill(0);
  }

  setActive(count: number): void {
    this.active = Math.max(0, Math.min(this.max, Math.floor(count)));
    for (let i = this.active; i < this.max; i++) this.bright[i] = 0;
    this.geometry.setDrawRange(0, this.active);
  }

  update(dt: number, time: number, speedScale: number, sim: MultiverseSimulation): void {
    const live = sim.live;
    for (let i = 0; i < this.active; i++) {
      const o = i * 3;
      // An ember from a collapsed timeline: drift and fade.
      if (this.life[i] > 0) {
        this.life[i] -= dt;
        this.position[o] += this.velocity[o] * dt;
        this.position[o + 1] += this.velocity[o + 1] * dt;
        this.position[o + 2] += this.velocity[o + 2] * dt;
        this.velocity[o + 1] -= 0.4 * dt;
        this.bright[i] = Math.max(0, this.life[i] / 1.6) * 1.4;
        if (this.life[i] <= 0) this.owner[i] = -1;
        continue;
      }
      let tl = this.owner[i] >= 0 ? sim.get(this.owner[i]) : undefined;
      if (!tl) {
        tl = this.attach(i, live, sim, time);
        if (!tl) {
          this.bright[i] = 0;
          continue;
        }
      }
      const progress = progressOf(tl, time);
      const phase = time - tl.collapseAt;
      if (phase > COLLAPSE.unstable) {
        // Break away from the dissolving thread.
        this.life[i] = 1 + this.rng() * 0.6;
        const a = this.rng() * Math.PI * 2;
        const b = this.rng() * 2 - 1;
        const s = 1.5 + this.rng() * 2.5;
        this.velocity[o] = Math.cos(a) * Math.sqrt(1 - b * b) * s;
        this.velocity[o + 1] = b * s;
        this.velocity[o + 2] = Math.sin(a) * Math.sqrt(1 - b * b) * s;
        this.tint[i] = 1;
        continue;
      }
      this.u[i] += (dt * this.speed[i] * speedScale) / tl.length;
      if (this.u[i] > progress || this.u[i] > 1) {
        this.owner[i] = -1;
        this.bright[i] = 0;
        continue;
      }
      sampleInto(tl.points, this.u[i], this.position, o);
      const fade = Math.min(1, this.u[i] * 12) * Math.min(1, (progress - this.u[i]) * 30 + 0.2);
      this.bright[i] = (0.35 + tl.energy * 0.75) * fade * (phase > 0 ? 1.4 : 1);
      this.tint[i] = phase > 0 ? 0.9 : tl.kind === "weave" ? 0.5 : 0;
    }
    (this.geometry.getAttribute("position") as BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute("aBright") as BufferAttribute).needsUpdate = true;
    (this.geometry.getAttribute("aTint") as BufferAttribute).needsUpdate = true;
  }

  private attach(i: number, live: readonly number[], sim: MultiverseSimulation, time: number): Timeline | undefined {
    if (!live.length) return undefined;
    // One particle in six rides the sacred line; the rest spread over the network.
    const id = this.rng() < 0.16 ? sim.rootId : live[Math.floor(this.rng() * live.length)];
    const tl = sim.get(id);
    if (!tl || time < tl.birthTime || sim.isCollapsing(tl.id)) return undefined;
    const progress = progressOf(tl, time);
    if (progress < 0.05) return undefined;
    this.owner[i] = tl.id;
    this.u[i] = this.rng() * progress * 0.9;
    this.speed[i] = (3.5 + this.rng() * 5) * (0.5 + tl.energy * 0.6) * (0.6 + tl.stability * 0.5);
    this.tint[i] = 0;
    return tl;
  }
}
