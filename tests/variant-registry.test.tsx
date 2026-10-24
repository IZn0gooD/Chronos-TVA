import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MotionProvider } from "@/components/motion/motion-provider";
import { VariantRegistry } from "@/components/chronos/variant-registry/variant-registry";
import { CATEGORY_LABELS, STATUS_LABELS, variants } from "@/data/variants";

function setup() {
  const user = userEvent.setup();
  render(
    <MotionProvider>
      <VariantRegistry variants={variants} statusLabels={STATUS_LABELS} categoryLabels={CATEGORY_LABELS} />
    </MotionProvider>,
  );
  return { user };
}

const files = () => within(screen.getByRole("list", { name: /registry files/i })).getAllByRole("listitem");

describe("VariantRegistry", () => {
  it("lists every file with its id and an open action", () => {
    setup();
    expect(files()).toHaveLength(variants.length);
    for (const v of variants) {
      expect(screen.getByRole("button", { name: new RegExp(`open file ${v.id}`, "i") })).toBeInTheDocument();
    }
  });

  it("filters by category and by status, and the count follows", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /^Temporal/ }));
    const temporal = variants.filter((v) => v.category === "temporal");
    expect(files()).toHaveLength(temporal.length);
    expect(screen.getByRole("status")).toHaveTextContent(`${temporal.length} of ${variants.length} files`);

    await user.click(screen.getByRole("button", { name: /^Contained/ }));
    const both = temporal.filter((v) => v.status === "contained");
    expect(files()).toHaveLength(both.length);
    expect(screen.getByRole("button", { name: /^Temporal/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("resets the filters", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /^Pruned/ }));
    await user.click(screen.getByRole("button", { name: /^Reset$/ }));
    expect(files()).toHaveLength(variants.length);
  });

  it("opens a file in a dialog and closes it", async () => {
    const { user } = setup();
    const target = variants[3];
    await user.click(screen.getByRole("button", { name: new RegExp(`open file ${target.id}`, "i") }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("heading", { name: target.name })).toBeInTheDocument();
    expect(dialog).toHaveTextContent(target.detail.slice(0, 40));
    await user.click(within(dialog).getByRole("button", { name: /close file/i }));
    expect(dialog).not.toHaveAttribute("open");
  });
});
