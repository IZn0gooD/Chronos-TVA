import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MotionProvider } from "@/components/motion/motion-provider";
import { TimelineExplorer } from "@/components/chronos/timeline-explorer/timeline-explorer";
import { BRANCH_STATE_LABELS, branches } from "@/data/branches";

// GSAP needs a real layout engine; the interaction under test does not.
vi.mock("@/lib/gsap", () => ({
  gsap: { matchMedia: () => ({ add: vi.fn(), revert: vi.fn() }) },
  useGSAP: vi.fn(),
  MOTION_CONDITIONS: { motionOK: "", reduced: "" },
  motionAllowed: () => false,
}));

function setup() {
  const user = userEvent.setup();
  render(
    <MotionProvider>
      <TimelineExplorer branches={branches} stateLabels={BRANCH_STATE_LABELS} notice="Fictional data." />
    </MotionProvider>,
  );
  return { user };
}

describe("TimelineExplorer", () => {
  it("opens on the sacred timeline and exposes a tablist", () => {
    setup();
    const tablist = screen.getByRole("tablist", { name: /timeline branches/i });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(branches.length);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(branches[0].label);
  });

  it("selects a branch on click and updates the panel", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /BR-1960-L/ }));
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Lighthouse branch");
    expect(panel).toHaveTextContent("0.74");
    expect(screen.getByRole("tab", { name: /BR-1960-L/ })).toHaveAttribute("aria-selected", "true");
  });

  it("moves the selection with the arrow keys, wrapping at the ends", async () => {
    const { user } = setup();
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(tabs[tabs.length - 1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowLeft}");
    expect(tabs[tabs.length - 1]).toHaveFocus();
  });

  it("keeps only the selected tab in the tab order", async () => {
    const { user } = setup();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.filter((t) => t.getAttribute("tabindex") === "0")).toHaveLength(1);
    await user.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute("tabindex", "0");
    expect(tabs[0]).toHaveAttribute("tabindex", "-1");
  });
});
