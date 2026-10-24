import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fieldColors } from "@/components/graphics/colors";
import { ARTIFACT_DEFAULTS, ARTIFACT_FRAGMENT, ARTIFACT_VERTEX } from "@/components/graphics/shaders/artifact";
import { TEMPORAL_FIELD_DEFAULTS, TEMPORAL_FIELD_FRAGMENT, TEMPORAL_FIELD_VERTEX } from "@/components/graphics/shaders/temporal-field";
import { palette } from "@/config/palette";
import { detectQuality, QUALITY_PRESETS, resolveEffects } from "@/lib/graphics-quality";
// Plain JavaScript on purpose: the same module `node scripts/theatre-state.mjs` runs.
import { buildState, RANGES, restingPose, SHEET } from "../scripts/theatre-state.mjs";

describe("rendering quality", () => {
  it("gives a desktop the full preset", () => {
    expect(detectQuality("full", { width: 1440, reducedMotion: false })).toEqual(QUALITY_PRESETS.full);
  });
  it("trims phones and constrained devices", () => {
    const phone = detectQuality("full", { width: 390, reducedMotion: false });
    expect(phone.particles).toBe(500);
    expect(phone.dpr).toEqual([1, 1.5]);
    const thrifty = detectQuality("full", { width: 1440, reducedMotion: false, saveData: true });
    expect(thrifty.dpr[1]).toBeLessThanOrEqual(1.25);
    expect(thrifty.fps).toBe(30);
    expect(thrifty.antialias).toBe(false);
  });
  it("holds still for readers who asked for less motion", () => {
    expect(detectQuality("full", { width: 1440, reducedMotion: true }).animate).toBe(false);
    expect(detectQuality("reduced", { width: 1440, reducedMotion: false })).toEqual(QUALITY_PRESETS.reduced);
  });
  it("resolves the configured effects level", () => {
    expect(resolveEffects("auto", false)).toBe("full");
    expect(resolveEffects("auto", true)).toBe("reduced");
    expect(resolveEffects("off", false)).toBe("off");
    expect(resolveEffects("full", true)).toBe("full");
  });
});

describe("shaders", () => {
  const declares = (source: string, name: string) => new RegExp("uniform [a-z0-9]+ " + name + ";").test(source);
  it("declare every documented uniform of the temporal field", () => {
    for (const name of Object.keys(TEMPORAL_FIELD_DEFAULTS)) expect(declares(TEMPORAL_FIELD_FRAGMENT, name), name).toBe(true);
    for (const name of Object.keys(fieldColors(palette))) expect(declares(TEMPORAL_FIELD_FRAGMENT, name), name).toBe(true);
  });
  it("declare every documented uniform of the artifact", () => {
    const both = ARTIFACT_VERTEX + ARTIFACT_FRAGMENT;
    for (const name of Object.keys(ARTIFACT_DEFAULTS)) expect(declares(both, name), name).toBe(true);
  });
  it("stay in GLSL ES 1.0: no version directive, constant loop bounds", () => {
    for (const src of [TEMPORAL_FIELD_VERTEX, TEMPORAL_FIELD_FRAGMENT, ARTIFACT_VERTEX, ARTIFACT_FRAGMENT]) {
      expect(src).not.toContain("#version");
      expect(src).not.toMatch(/i < u[A-Za-z]+;/);
    }
  });
});

describe("theatre state", () => {
  const state = buildState();
  const sheet = state.sheetsById[SHEET];
  it("is what data/theatre/chamber.json holds", () => {
    const onDisk = JSON.parse(readFileSync(path.resolve(process.cwd(), "data/theatre/chamber.json"), "utf8"));
    expect(onDisk).toEqual(state);
    const pose = JSON.parse(readFileSync(path.resolve(process.cwd(), "data/theatre/resting-pose.json"), "utf8"));
    expect(pose).toEqual(restingPose());
  });
  it("keeps every track sorted and inside the sequence", () => {
    for (const object of Object.values(sheet.sequence.tracksByObject)) {
      for (const track of Object.values(object.trackData)) {
        const positions = track.keyframes.map((k) => k.position);
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
        expect(positions.at(-1)).toBeLessThanOrEqual(sheet.sequence.length);
      }
    }
  });
  it("rests at the same pose before and after a variance", () => {
    const [, entranceEnd] = RANGES.entrance;
    const [eventStart, eventEnd] = RANGES.event;
    for (const object of Object.values(sheet.sequence.tracksByObject)) {
      for (const track of Object.values(object.trackData)) {
        const at = (p: number) => track.keyframes.find((k) => k.position === p)?.value;
        const rest = at(entranceEnd) ?? at(eventStart);
        expect(at(eventStart) ?? rest).toBe(rest);
        // After its last keyframe a track holds its value, so the last one is the pose the event leaves behind.
        const last = track.keyframes.at(-1);
        expect(last?.position).toBeLessThanOrEqual(eventEnd);
        expect(last?.value).toBe(rest);
      }
    }
  });
});
