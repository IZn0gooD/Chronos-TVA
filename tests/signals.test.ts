import { afterEach, describe, expect, it } from "vitest";
import { consultFile, damp, frame, scene, selectBranch, triggerTemporalEvent } from "@/lib/signals";

afterEach(() => scene.reset());

describe("scene signals", () => {
  it("starts on the sacred timeline with nothing consulted", () => {
    const s = scene.get();
    expect(s.branchState).toBe("sacred");
    expect(s.branchIndex).toBe(0);
    expect(s.events).toBe(0);
    expect(s.filesConsulted).toBe(0);
  });

  it("counts temporal events and stamps their time", () => {
    triggerTemporalEvent(1234);
    triggerTemporalEvent(2345);
    expect(scene.get().events).toBe(2);
    expect(scene.get().eventAt).toBe(2345);
  });

  it("notifies subscribers once per change and stops after unsubscribe", () => {
    let calls = 0;
    const unsubscribe = scene.subscribe(() => calls++);
    selectBranch("BR-1960-L", "nexus", 2);
    expect(calls).toBe(1);
    expect(scene.get()).toMatchObject({ branchId: "BR-1960-L", branchState: "nexus", branchIndex: 2 });
    unsubscribe();
    selectBranch(null, "sacred", 0);
    expect(calls).toBe(1);
  });

  it("counts the files consulted and remembers the last", () => {
    consultFile("VR-0427");
    consultFile("VR-1138");
    expect(scene.get().filesConsulted).toBe(2);
    expect(scene.get().variantId).toBe("VR-1138");
  });

  it("damps toward the target without overshooting", () => {
    let v = 0;
    for (let i = 0; i < 60; i++) v = damp(v, 1, 5, 1 / 60);
    expect(v).toBeGreaterThan(0.9);
    expect(v).toBeLessThanOrEqual(1);
  });

  it("keeps the high-frequency signals as plain numbers", () => {
    expect(frame.pointer).toEqual({ x: 0, y: 0 });
    expect(frame.hero).toBe(0);
    expect(frame.page).toBe(0);
  });
});
