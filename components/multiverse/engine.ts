"use client";

import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  PerspectiveCamera,
  ShaderMaterial,
  Vector2,
  Vector3,
  type IUniform,
  type Scene,
  type WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import type { Quality } from "@/lib/graphics-quality";
import { sample, sampleInto } from "@/lib/multiverse/curves";
import { mulberry32 } from "@/lib/multiverse/random";
import {
  CINEMATIC_END,
  COLLAPSE,
  LOOM,
  phaseAt,
  progressOf,
  PULSE_SPEED,
  TICK,
  timelineName,
  type MultiverseEvent,
  type Timeline,
} from "@/lib/multiverse/simulation";
import type { FeedLine, LabStore, SelectionInfo } from "./lab-store";
import { MultiverseRuntime } from "./runtime";
import * as glsl from "./shaders";
import { MULTIVERSE_TINTS } from "./tints";
import { CINEMATIC_RANGE, finalPose, getMultiverseTheatre, type CinematicValues } from "./theatre";

export { MULTIVERSE_TINTS };

export interface Budget {
  capacity: number;
  particles: number;
  dprMax: number;
  level: 0 | 1 | 2;
  pinned: boolean;
  animate: boolean;
}

/** Capacity, particle count and starting quality level from the device's quality preset; `?q=0|1|2` pins the level. */
export function budgetFor(q: Quality, search: URLSearchParams): Budget {
  const big = q.particles >= 1200;
  const mid = q.particles >= 500;
  const pin = search.get("q");
  const pinned = pin === "0" || pin === "1" || pin === "2";
  return {
    capacity: big ? 2048 : mid ? 1280 : 900,
    particles: big ? 3600 : mid ? 1800 : 900,
    dprMax: q.dpr[1],
    level: pinned ? (Number(pin) as 0 | 1 | 2) : big && q.antialias ? 0 : mid ? 1 : 2,
    pinned,
    animate: q.animate,
  };
}

type Uniforms = Record<string, IUniform>;

/** One autopilot shot: a subject (fixed or followed), a direction to look from, a distance, a slow orbit. */
interface Shot {
  label: string;
  until: number;
  target: Vector3;
  dir: Vector3;
  distance: number;
  orbit: number;
  followId?: number;
}
const pick = (u: Uniforms, names: string[]): Uniforms => Object.fromEntries(names.map((n) => [n, u[n]]));

/**
 * The lab's single owner of everything that moves. It holds the
 * simulation and its GPU buffers, decides who drives the camera (Theatre
 * during the cinematic, the orbit controls afterwards), renders through
 * the bloom composer, measures itself and adapts its quality, and answers
 * the HUD's commands. React components only host it: no per-frame state
 * ever passes through React.
 */
export class LabEngine {
  readonly runtime: MultiverseRuntime;
  readonly theatre = getMultiverseTheatre();
  readonly budget: Budget;
  readonly uniforms: Uniforms;
  readonly materials: Record<"filament" | "nodes" | "particles" | "loom" | "sky" | "dust", ShaderMaterial>;
  readonly dust = new BufferGeometry();
  readonly loomPosition = LOOM;

  mode: "cinematic" | "explore" = "cinematic";
  playing = false;
  displayTime = 0;
  expansionRate = 1;
  densityScale = 1;
  selected: number | null = null;
  level: 0 | 1 | 2;

  private readonly store: LabStore;
  private readonly studio: boolean;
  private readonly reduced: boolean;
  private renderer: WebGLRenderer | null = null;
  private camera: PerspectiveCamera | null = null;
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private controls: OrbitControls | null = null;
  private controlsActive = false;
  /** The pose the controls take over from: the live Theatre values after the cinematic, the known final pose when settling. */
  private handoverPose: CinematicValues | null = null;
  private focus: { target: Vector3; position: Vector3 } | null = null;
  private setDpr: ((dpr: number) => void) | null = null;
  private invalidate: (() => void) | null = null;
  private readonly lookTarget = new Vector3();
  private readonly tmp = new Vector3();
  private readonly drawSize = new Vector2();
  /** The camera's autopilot after the cinematic: it goes from event to event while the reader does not drive. */
  autopilot = true;
  private lastInput = -Infinity;
  private shot: Shot | null = null;
  private shotCount = 0;
  private lastShotKind = "";
  private readonly shown = new Set<string>();
  private publishAt = 0;
  private frames = 0;
  private frameWindow = 0;
  private fps = 0;
  private frameMs = 0;
  private governorAt = 0;
  private levelChangedAt = 0;

  constructor(budget: Budget, store: LabStore, options: { studio: boolean; reduced: boolean; seed?: number }) {
    this.budget = budget;
    this.level = budget.level;
    this.store = store;
    this.studio = options.studio;
    this.reduced = options.reduced;
    this.runtime = new MultiverseRuntime({ seed: options.seed, capacity: budget.capacity, particles: budget.particles });
    this.autopilot = !options.reduced;

    const c = Object.fromEntries(Object.entries(MULTIVERSE_TINTS).map(([k, v]) => [k, new Color(v)])) as Record<keyof typeof MULTIVERSE_TINTS, Color>;
    this.uniforms = {
      uState: { value: this.runtime.state },
      uSimTime: { value: 0 },
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uPixelRatio: { value: 1 },
      uDensity: { value: 1 },
      uInstability: { value: 0 },
      uWidth: { value: 1 },
      uEnergy: { value: 1 },
      uFabric: { value: 1 },
      uDim: { value: 1 },
      uPulseSpeed: { value: PULSE_SPEED },
      uFogNear: { value: 70 },
      uFogFar: { value: 300 },
      uScale: { value: 3 },
      uNodeScale: { value: 1 },
      uBeat: { value: 0 },
      uSize: { value: 4.5 },
      uLoomDir: { value: new Vector3(...LOOM).normalize() },
      uAmber: { value: c.amber },
      uGold: { value: c.gold },
      uCopper: { value: c.copper },
      uWarm: { value: c.warm },
      uWeave: { value: c.weave },
      uEmber: { value: c.ember },
      uNight: { value: c.night },
      uDeep: { value: c.deep },
      uHaze: { value: c.haze },
      uColor: { value: c.gold },
    };
    const u = this.uniforms;
    const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending } as const;
    this.materials = {
      filament: new ShaderMaterial({
        ...additive,
        side: DoubleSide,
        vertexShader: glsl.FILAMENT_VERTEX,
        fragmentShader: glsl.FILAMENT_FRAGMENT,
        uniforms: pick(u, ["uState", "uSimTime", "uTime", "uResolution", "uPixelRatio", "uDensity", "uInstability", "uWidth", "uEnergy", "uFabric", "uDim", "uPulseSpeed", "uFogNear", "uFogFar", "uAmber", "uGold", "uCopper", "uWarm", "uWeave", "uEmber"]),
      }),
      nodes: new ShaderMaterial({
        ...additive,
        vertexShader: glsl.NODE_VERTEX,
        fragmentShader: glsl.NODE_FRAGMENT,
        uniforms: pick(u, ["uState", "uSimTime", "uTime", "uPixelRatio", "uDensity", "uNodeScale", "uDim", "uGold", "uWarm", "uWeave", "uEmber"]),
      }),
      particles: new ShaderMaterial({
        ...additive,
        vertexShader: glsl.PARTICLE_VERTEX,
        fragmentShader: glsl.PARTICLE_FRAGMENT,
        uniforms: pick(u, ["uPixelRatio", "uScale", "uGold", "uWarm", "uWeave", "uEmber"]),
      }),
      loom: new ShaderMaterial({
        ...additive,
        vertexShader: glsl.LOOM_VERTEX,
        fragmentShader: glsl.LOOM_FRAGMENT,
        uniforms: pick(u, ["uTime", "uBeat", "uEnergy", "uSize", "uGold", "uWarm", "uCopper"]),
      }),
      sky: new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        vertexShader: glsl.SKY_VERTEX,
        fragmentShader: glsl.SKY_FRAGMENT,
        uniforms: pick(u, ["uTime", "uNight", "uDeep", "uHaze", "uLoomDir"]),
      }),
      dust: new ShaderMaterial({
        ...additive,
        vertexShader: glsl.DUST_VERTEX,
        fragmentShader: glsl.DUST_FRAGMENT,
        uniforms: pick(u, ["uTime", "uPixelRatio", "uColor"]),
      }),
    };

    const rng = mulberry32(0xd057);
    const count = budget.capacity >= 2048 ? 2200 : 1100;
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 30 + Math.pow(rng(), 0.6) * 170;
      const a = rng() * Math.PI * 2;
      const b = rng() * 2 - 1;
      pos.set([Math.cos(a) * Math.sqrt(1 - b * b) * r, b * r * 0.7, Math.sin(a) * Math.sqrt(1 - b * b) * r], i * 3);
      phase[i] = rng() * 100;
    }
    this.dust.setAttribute("position", new BufferAttribute(pos, 3));
    this.dust.setAttribute("aPhase", new BufferAttribute(phase, 1));
    // No store writes here: the constructor runs during React's render (useMemo); the first publish happens in attach().
  }

  // ─── lifecycle ───────────────────────────────────────────────────────────

  /** Called once the renderer exists: composer, controls, first state. Returns the cleanup. */
  attach(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, hooks: { setDpr: (dpr: number) => void; invalidate: () => void }): () => void {
    this.renderer = renderer;
    this.camera = camera;
    this.setDpr = hooks.setDpr;
    this.invalidate = hooks.invalidate;
    renderer.info.autoReset = false;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new Vector2(256, 256), 1, 0.5, 0.68);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());
    this.composer = composer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 260;
    controls.autoRotateSpeed = 0.35;
    controls.enabled = false;
    controls.addEventListener("start", () => {
      this.focus = null;
      this.noteInput();
    });
    controls.addEventListener("change", () => this.invalidate?.());
    this.controls = controls;

    // On-demand rendering (reduced motion) must still redraw when Theatre's values arrive.
    const stopListening = this.theatre.onChange(() => this.invalidate?.());
    this.applyLevel(this.level, true);
    this.store.set({ status: "live", capacity: this.budget.capacity, studio: this.studio, reduced: this.reduced, level: this.level, pinned: this.budget.pinned });
    if (this.budget.animate && !this.reduced) this.playCinematic();
    else this.settleAtEnd();

    return () => {
      stopListening();
      controls.dispose();
      composer.dispose();
      this.bloom?.dispose();
      this.composer = null;
      this.controls = null;
      this.renderer = null;
      this.camera = null;
    };
  }

  resize(width: number, height: number, dpr: number): void {
    this.composer?.setPixelRatio(dpr);
    this.composer?.setSize(width, height);
    this.invalidate?.();
  }

  dispose(): void {
    this.theatre.sheet.sequence.pause();
    this.runtime.dispose();
    this.dust.dispose();
    for (const m of Object.values(this.materials)) m.dispose();
  }

  // ─── modes ───────────────────────────────────────────────────────────────

  /** From the loom: a fresh simulation (reader commands forgotten), the camera on Theatre, the sequence from 0. */
  playCinematic(): void {
    const seq = this.theatre.sheet.sequence;
    this.runtime.sim.clearReaderLog();
    this.runtime.sim.seek(0);
    this.select(null);
    this.mode = "cinematic";
    this.controlsActive = false;
    seq.position = 0;
    this.playing = true;
    this.runSequence();
    this.publish(true);
  }

  private runSequence(): void {
    void this.theatre.ready.then(() =>
      this.theatre.sheet.sequence.play({ range: [CINEMATIC_RANGE[0], CINEMATIC_RANGE[1]] }).then((finished) => {
        if (finished && !this.studio && this.mode === "cinematic") this.enterExplore();
      }),
    );
  }

  /** Readers who asked for less motion arrive on the revealed network, still; the cinematic stays one button away. */
  settleAtEnd(): void {
    this.theatre.sheet.sequence.position = CINEMATIC_END;
    this.runtime.sim.seek(CINEMATIC_END);
    this.displayTime = CINEMATIC_END;
    this.mode = "explore";
    this.playing = false;
    this.controlsActive = false;
    this.handoverPose = finalPose;
    // A position set before the project is ready may not stick: set it again once it is.
    void this.theatre.ready.then(() => {
      if (this.mode === "explore" && !this.playing) this.theatre.sheet.sequence.position = CINEMATIC_END;
      this.invalidate?.();
    });
    this.publish(true);
    this.invalidate?.();
  }

  /** The cinematic is over: the orbit controls take the camera where Theatre left it, and the network lives on. */
  enterExplore(): void {
    this.handoverPose = null;
    this.mode = "explore";
    this.displayTime = Math.max(this.displayTime, this.runtime.sim.time);
    this.playing = !this.reduced;
    this.controlsActive = false;
    this.publish(true);
  }

  togglePlay(): void {
    const seq = this.theatre.sheet.sequence;
    if (this.mode === "cinematic") {
      if (this.playing) {
        seq.pause();
        this.playing = false;
      } else {
        this.playing = true;
        this.runSequence();
      }
    } else {
      this.playing = !this.playing;
    }
    this.publish(true);
    this.invalidate?.();
  }

  skipToNetwork(): void {
    this.theatre.sheet.sequence.pause();
    this.theatre.sheet.sequence.position = CINEMATIC_END;
    this.runtime.sim.advance(CINEMATIC_END);
    this.displayTime = CINEMATIC_END;
    this.enterExplore();
  }

  // ─── the frame ───────────────────────────────────────────────────────────

  frame(dt: number, elapsed: number): void {
    const step = Math.min(dt, 0.1);
    const sim = this.runtime.sim;
    const world = this.theatre.values.world;

    if (this.mode === "cinematic") {
      const t = this.theatre.sheet.sequence.position;
      if (t < sim.time - TICK * 1.5) sim.seek(t);
      else sim.advance(t);
      this.displayTime = t;
    } else if (this.playing) {
      this.displayTime += step * this.expansionRate;
      sim.advance(this.displayTime);
    }
    if (this.selected !== null && !sim.get(this.selected)) this.select(null);
    this.runtime.sync();

    this.runtime.flow.update(this.playing ? step * (this.mode === "explore" ? this.expansionRate : 1) : 0, this.displayTime, world.particleSpeed, sim);

    const u = this.uniforms;
    u.uSimTime.value = this.displayTime;
    u.uTime.value = elapsed;
    u.uEnergy.value = world.filamentEnergy;
    u.uFabric.value = world.fabric;
    u.uInstability.value = world.instability;
    u.uDensity.value = Math.min(1, world.branchDensity * this.densityScale);
    u.uDim.value = this.selected !== null ? 0.35 : 1;
    const root = sim.get(sim.rootId);
    if (root) {
      const last = Math.max(root.pulses[0] <= this.displayTime ? root.pulses[0] : -1e6, root.pulses[2] <= this.displayTime ? root.pulses[2] : -1e6);
      u.uBeat.value = Math.exp(-(this.displayTime - last) * 2.5);
    }
    if (this.renderer) {
      this.renderer.getDrawingBufferSize(this.drawSize);
      (u.uResolution.value as Vector2).copy(this.drawSize);
      u.uPixelRatio.value = this.renderer.getPixelRatio();
      this.renderer.toneMappingExposure = world.exposure;
    }
    if (this.bloom) this.bloom.strength = world.bloomStrength * 0.75;

    this.updateCamera(step);
    this.measure(dt, elapsed);
  }

  render(): void {
    if (!this.composer || !this.renderer) return;
    this.renderer.info.reset();
    this.composer.render();
  }

  private updateCamera(dt: number): void {
    const camera = this.camera;
    const controls = this.controls;
    if (!camera || !controls) return;
    const v = this.theatre.values;
    if (this.mode === "cinematic") {
      controls.enabled = false;
      camera.position.set(v.camera.x, v.camera.y, v.camera.z);
      this.lookTarget.set(v.target.x, v.target.y, v.target.z);
      camera.lookAt(this.lookTarget);
      if (Math.abs(camera.fov - v.camera.fov) > 0.01) {
        camera.fov = v.camera.fov;
        camera.updateProjectionMatrix();
      }
      return;
    }
    if (!this.controlsActive) {
      // Hand-over: the controls start exactly on the pose the cinematic ends on (or left the camera at).
      const p = this.handoverPose ?? v;
      camera.position.set(p.camera.x, p.camera.y, p.camera.z);
      if (Math.abs(camera.fov - p.camera.fov) > 0.01) {
        camera.fov = p.camera.fov;
        camera.updateProjectionMatrix();
      }
      controls.target.set(p.target.x, p.target.y, p.target.z);
      controls.enabled = true;
      this.controlsActive = true;
    }
    if (this.focus) {
      const k = 1 - Math.exp(-3.2 * dt);
      controls.target.lerp(this.focus.target, k);
      camera.position.lerp(this.focus.position, k);
      if (camera.position.distanceTo(this.focus.position) < 0.05) this.focus = null;
      this.invalidate?.();
    }
    const now = this.uniforms.uTime.value as number;
    const directing = this.autopilot && !this.focus && this.selected === null && now - this.lastInput > 9;
    if (directing) this.direct(dt, now, camera, controls);
    else this.shot = null;
    controls.autoRotate = !directing && !this.autopilot && this.playing && this.selected === null && !this.focus;
    controls.update(dt);
  }

  // ─── autopilot ───────────────────────────────────────────────────────────

  /** The reader touched the camera or the network: the autopilot waits 9 s before taking over again. */
  noteInput(): void {
    this.lastInput = this.uniforms.uTime.value as number;
    this.shot = null;
  }

  setAutopilot(on: boolean): void {
    this.autopilot = on;
    this.shot = null;
    if (on) this.lastInput = -Infinity;
    this.publish(true);
    this.invalidate?.();
  }

  /** Glides towards the current shot; picks the next one when it has run its time or its subject is gone. */
  private direct(dt: number, now: number, camera: PerspectiveCamera, controls: OrbitControls): void {
    const sim = this.runtime.sim;
    let s = this.shot;
    if (!s || now > s.until || (s.followId !== undefined && !sim.get(s.followId))) s = this.shot = this.nextShot(now);
    if (s.followId !== undefined) {
      const tl = sim.get(s.followId);
      if (tl) {
        const head = sample(tl.points, Math.max(0.05, progressOf(tl, this.displayTime)) * 0.96);
        s.target.lerp(this.tmp.set(head[0], head[1], head[2]), 1 - Math.exp(-1.6 * dt));
      }
    }
    // A slow orbit around the subject, and a glide (critically damped, never a cut) towards it.
    const a = s.orbit * dt;
    const x = s.dir.x * Math.cos(a) - s.dir.z * Math.sin(a);
    s.dir.z = s.dir.x * Math.sin(a) + s.dir.z * Math.cos(a);
    s.dir.x = x;
    const eye = this.tmp.copy(s.target).addScaledVector(s.dir, s.distance);
    const k = 1 - Math.exp(-0.65 * dt);
    controls.target.lerp(s.target, k);
    camera.position.lerp(eye, k);
  }

  private nextShot(now: number): Shot {
    const sim = this.runtime.sim;
    this.shotCount++;
    const dir = (up: number) => new Vector3(Math.random() * 2 - 1, up, Math.random() * 2 - 1 + 0.6).normalize();
    // Every fourth shot steps back to show the whole network and how its shape has moved.
    if (this.shotCount % 4 !== 0) {
      // The freshest notable event not shown yet: a weave, a pruning with a family, a new trunk.
      for (let i = sim.feed.length - 1; i >= 0; i--) {
        const e = sim.feed[i];
        if (e.time < this.displayTime - 14) break;
        const key = `${e.type}-${e.time}`;
        if (this.shown.has(key)) continue;
        // Big prunings, weaves and new trunks only; and never the same kind of subject twice in a row.
        const notable = e.type === "weave" || (e.type === "collapse" && e.descendants >= 8) || (e.type === "birth" && e.depth <= 1);
        const tl = e.type === "era" ? undefined : sim.get(e.id);
        if (!notable || !tl || e.type === this.lastShotKind) continue;
        this.shown.add(key);
        if (this.shown.size > 200) this.shown.clear();
        this.lastShotKind = e.type;
        const p = sample(tl.points, e.type === "birth" ? 0.2 : 0.55);
        return {
          label: e.type === "weave" ? `Weave · ${this.nameOf(tl)}` : e.type === "collapse" ? `Pruning · ${this.nameOf(tl)}` : `New trunk · ${this.nameOf(tl)}`,
          until: now + 9 + Math.random() * 4,
          target: new Vector3(...p),
          dir: dir(0.15 + Math.random() * 0.4),
          distance: e.type === "collapse" ? 52 + Math.random() * 16 : 40 + Math.random() * 16,
          orbit: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.05),
          followId: e.type === "birth" ? tl.id : undefined,
        };
      }
      // Otherwise ride a branch that is growing right now.
      const recent = sim.recentBirths;
      for (let i = recent.length - 1; i >= Math.max(0, recent.length - 40); i--) {
        const tl = sim.get(recent[Math.floor(Math.random() * recent.length)]);
        if (!tl || progressOf(tl, this.displayTime) > 0.6 || sim.isCollapsing(tl.id)) continue;
        this.lastShotKind = "follow";
        return {
          label: `Following ${this.nameOf(tl)}`,
          until: now + 8 + Math.random() * 3,
          target: new Vector3(...sample(tl.points, Math.max(0.05, progressOf(tl, this.displayTime)))),
          dir: dir(0.1 + Math.random() * 0.3),
          distance: 30 + Math.random() * 14,
          orbit: (Math.random() < 0.5 ? -1 : 1) * 0.06,
          followId: tl.id,
        };
      }
    }
    // The wide view: centre and spread of the network as it is now.
    const live = sim.live;
    const c = new Vector3();
    let n = 0;
    let spread = 0;
    const pts: Vector3[] = [];
    for (let i = 0; i < 160 && live.length; i++) {
      const tl = sim.get(live[Math.floor(Math.random() * live.length)]);
      if (!tl || tl.kind === "fabric") continue;
      const p = new Vector3(...sample(tl.points, 1));
      pts.push(p);
      c.add(p);
      n++;
    }
    if (n) c.divideScalar(n);
    for (const p of pts) spread = Math.max(spread, p.distanceTo(c));
    this.lastShotKind = "wide";
    return {
      label: "The whole network",
      until: now + 12 + Math.random() * 5,
      target: c,
      dir: dir(0.25 + Math.random() * 0.3),
      distance: Math.min(220, Math.max(110, spread * 2.2)),
      orbit: (Math.random() < 0.5 ? -1 : 1) * 0.04,
    };
  }

  // ─── measurement and adaptive quality ────────────────────────────────────

  private measure(dt: number, elapsed: number): void {
    this.frames++;
    this.frameWindow += dt;
    this.frameMs = this.frameMs ? this.frameMs * 0.92 + dt * 1000 * 0.08 : dt * 1000;
    if (this.frameWindow >= 1) {
      this.fps = this.frames / this.frameWindow;
      this.frames = 0;
      this.frameWindow = 0;
    }
    // Governor: every 2 s, step down if frames are slow, step back up after a long calm.
    if (!this.budget.pinned && this.budget.animate && elapsed - this.governorAt > 2) {
      this.governorAt = elapsed;
      if (this.frameMs > 24 && this.level < 2) this.applyLevel((this.level + 1) as 1 | 2);
      else if (this.frameMs < 12 && this.level > this.budget.level && elapsed - this.levelChangedAt > 8) this.applyLevel((this.level - 1) as 0 | 1);
    }
    if (elapsed >= this.publishAt) {
      this.publishAt = elapsed + 0.25;
      this.publish(false);
    }
  }

  private applyLevel(level: 0 | 1 | 2, initial = false): void {
    this.level = level;
    this.levelChangedAt = this.uniforms.uTime.value as number;
    const dpr = level === 0 ? this.budget.dprMax : level === 1 ? Math.min(1.25, this.budget.dprMax) : 1;
    this.setDpr?.(Math.min(window.devicePixelRatio || 1, dpr));
    this.runtime.flow.setActive(this.budget.particles * [1, 0.7, 0.4][level]);
    if (this.bloom) this.bloom.enabled = level < 2;
    if (!initial) this.publish(true);
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  private publish(force: boolean): void {
    if (!force && !this.renderer) return;
    const sim = this.runtime.sim;
    const era = sim.eraAt(this.displayTime);
    const phase = era ?? phaseAt(this.displayTime);
    const info = this.renderer?.info;
    this.store.set({
      mode: this.mode,
      playing: this.playing,
      animating: this.playing || (this.mode === "cinematic" && this.theatre.sheet.sequence.position < CINEMATIC_END),
      simTime: this.displayTime,
      phase: phase.name,
      phaseNote: phase.note,
      cinematicProgress: Math.min(1, this.theatre.sheet.sequence.position / CINEMATIC_END),
      live: sim.liveCount,
      born: sim.stats.born,
      pruned: sim.stats.pruned,
      woven: sim.stats.woven,
      pulses: sim.stats.pulses,
      fps: Math.round(this.fps),
      frameMs: Math.round(this.frameMs * 10) / 10,
      calls: info?.render.calls ?? 0,
      triangles: info?.render.triangles ?? 0,
      level: this.level,
      dpr: this.renderer?.getPixelRatio() ?? 1,
      particles: this.runtime.flow.active,
      bloom: this.level < 2,
      selection: this.selectionInfo(),
      feed: this.feedLines(),
      expansionRate: this.expansionRate,
      density: this.densityScale,
      era: era ? era.index : null,
      autopilot: this.autopilot,
      shot: this.shot?.label ?? "",
    });
  }

  private selectionInfo(): SelectionInfo | null {
    const sim = this.runtime.sim;
    const tl = sim.get(this.selected);
    if (!tl) return null;
    const t = this.displayTime;
    const phase = t - tl.collapseAt;
    const parent = sim.get(tl.parentId);
    const siblings = parent ? parent.children.filter((c) => sim.get(c)?.kind === tl.kind) : [];
    return {
      id: tl.id,
      name: this.nameOf(tl),
      kind: tl.kind,
      parent: parent ? this.nameOf(parent) : null,
      depth: tl.depth,
      born: tl.birthTime,
      age: Math.max(0, t - tl.birthTime),
      energy: tl.energy,
      stability: tl.stability,
      children: tl.children.length,
      descendants: sim.descendants(tl.id),
      state: phase > COLLAPSE.unstable ? "dissolving" : phase > 0 ? "unstable" : progressOf(tl, t) < 1 ? "growing" : "stable",
      weave: tl.weave ? `${this.nameOf(sim.get(tl.weave[0]))} × ${this.nameOf(sim.get(tl.weave[1]))}` : null,
      canParent: !!parent,
      canChild: tl.children.length > 0,
      canSibling: siblings.length > 1,
      canBranch: (tl.kind === "branch" || tl.kind === "root") && !sim.isCollapsing(tl.id),
      canPrune: tl.kind !== "root" && !sim.isCollapsing(tl.id),
    };
  }

  nameOf(tl: Timeline | undefined): string {
    if (!tl) return "—";
    return timelineName(tl, tl.kind === "fabric" ? tl.id + 1 : undefined);
  }

  private feedLines(): FeedLine[] {
    const sim = this.runtime.sim;
    // A timeline may be gone by the time its event is read (pruned and dissolved): name it from its id.
    const name = (id: number) => {
      const tl = sim.get(id);
      return tl ? this.nameOf(tl) : `TL-${String(id).padStart(4, "0")}`;
    };
    const text = (e: MultiverseEvent): string => {
      switch (e.type) {
        case "era":
          return `Era ${String(e.index + 1).padStart(2, "0")} begins · ${e.name}`;
        case "birth":
          return `${e.byReader ? "Branched by you" : "Divergence"} · ${name(e.id)} from ${e.parentId === null ? "—" : name(e.parentId)}`;
        case "pulse":
          return `Pulse sent · ${name(e.id)}`;
        case "collapse":
          return `${e.byReader ? "Pruned by you" : "Pruned"} · ${name(e.id)}${e.descendants ? ` + ${e.descendants}` : ""}`;
        case "weave":
          return `Weave · ${name(e.a)} × ${name(e.b)}`;
      }
    };
    return sim.feed.slice(-5).reverse().map((e, i) => ({
      key: `${e.time.toFixed(3)}-${e.type}-${i}`,
      time: `T+${e.time.toFixed(1).padStart(5, "0")}`,
      text: text(e),
      tone: e.type === "birth" ? "birth" : e.type,
    }));
  }

  // ─── commands ────────────────────────────────────────────────────────────

  /** The timeline nearest to a point on the canvas (CSS pixels), within 14 px. */
  pick(x: number, y: number, width: number, height: number): number | null {
    const camera = this.camera;
    if (!camera) return null;
    const sim = this.runtime.sim;
    const density = this.uniforms.uDensity.value as number;
    const p: [number, number, number] = [0, 0, 0];
    let best: number | null = null;
    let bestD = 14 * 14;
    for (const id of sim.live) {
      const tl = sim.get(id);
      if (!tl || tl.kind === "fabric" || tl.rank > density) continue;
      const progress = progressOf(tl, this.displayTime);
      if (progress <= 0) continue;
      for (let k = 0; k <= 10; k++) {
        sampleInto(tl.points, (k / 10) * progress, p);
        this.tmp.set(p[0], p[1], p[2]).project(camera);
        if (this.tmp.z > 1) continue;
        const dx = (this.tmp.x * 0.5 + 0.5) * width - x;
        const dy = (-this.tmp.y * 0.5 + 0.5) * height - y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = id;
        }
      }
    }
    return best;
  }

  select(id: number | null): void {
    this.selected = id;
    this.runtime.sim.setSelection(id);
    this.publish(true);
    this.invalidate?.();
  }

  selectRelative(which: "parent" | "child" | "next" | "previous"): void {
    const sim = this.runtime.sim;
    const tl = sim.get(this.selected);
    if (!tl) return;
    if (which === "parent" && tl.parentId !== null) this.select(tl.parentId);
    else if (which === "child" && tl.children.length) this.select(tl.children[0]);
    else if (which === "next" || which === "previous") {
      const parent = sim.get(tl.parentId);
      if (!parent) return;
      const sibs = parent.children.filter((c) => sim.get(c)?.kind === tl.kind);
      const i = sibs.indexOf(tl.id);
      const j = (i + (which === "next" ? 1 : -1) + sibs.length) % sibs.length;
      this.select(sibs[j]);
    }
  }

  /** A random visible timeline, for keyboard readers starting a walk through the network. */
  selectAny(): void {
    const sim = this.runtime.sim;
    const ids = sim.live.filter((id) => {
      const tl = sim.get(id);
      return tl && tl.kind === "branch" && tl.depth <= 2 && progressOf(tl, this.displayTime) >= 1;
    });
    if (ids.length) this.select(ids[Math.floor(Math.random() * ids.length)]);
    else this.select(sim.rootId);
  }

  /** Flies the camera to the selected timeline (explore mode only; the cinematic keeps its own camera). */
  focusSelected(): void {
    const tl = this.runtime.sim.get(this.selected);
    const camera = this.camera;
    if (!tl || !camera) return;
    if (this.mode === "cinematic") this.skipToNetwork();
    const tip = sample(tl.points, Math.min(1, progressOf(tl, this.displayTime)) * 0.85);
    const target = new Vector3(...tip);
    const away = camera.position.clone().sub(target).normalize().multiplyScalar(Math.max(10, tl.length * 0.9));
    this.focus = { target, position: target.clone().add(away) };
    this.invalidate?.();
  }

  command(type: "pulse" | "branch" | "collapse", id?: number | null): void {
    const sim = this.runtime.sim;
    const target = id ?? this.selected;
    if (type === "pulse") sim.command({ type: "pulse", id: target ?? sim.rootId });
    else if (type === "branch" && target !== null && target !== undefined) sim.command({ type: "branch", parentId: target });
    else if (type === "collapse" && target !== null && target !== undefined) sim.command({ type: "collapse", id: target });
    // A paused or still network must still take the command: advance one tick.
    if (!this.playing || this.mode === "cinematic") {
      sim.advance(sim.time + TICK);
      if (this.mode === "explore") this.displayTime = Math.max(this.displayTime, sim.time);
    }
    this.publish(true);
    this.invalidate?.();
  }

  /** Prunes an old outlying branch chosen by the desk (with its descendants). */
  pruneSomething(): void {
    const sim = this.runtime.sim;
    let oldest: Timeline | null = null;
    for (const id of sim.live) {
      const tl = sim.get(id);
      if (!tl || tl.kind !== "branch" || tl.depth < 2 || sim.isCollapsing(id) || tl.children.length === 0) continue;
      if (!oldest || tl.birthTime < oldest.birthTime) oldest = tl;
    }
    if (oldest) this.command("collapse", oldest.id);
  }

  setExpansionRate(rate: number): void {
    this.expansionRate = rate;
    this.publish(true);
  }

  setDensity(d: number): void {
    this.densityScale = d;
    this.uniforms.uDensity.value = Math.min(1, this.theatre.values.world.branchDensity * d);
    this.publish(true);
    this.invalidate?.();
  }

  pinLevel(level: 0 | 1 | 2): void {
    this.budget.pinned = true;
    this.applyLevel(level);
    this.invalidate?.();
  }
}
