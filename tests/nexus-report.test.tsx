import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NexusReportForm } from "@/components/chronos/nexus-report";
import { CATEGORY_LABELS } from "@/data/variants";

const BRANCHES = [
  { id: "SL-0", label: "Sacred Timeline" },
  { id: "BR-1962-A", label: "Sector 12 divergence" },
];

function setup() {
  const user = userEvent.setup();
  render(<NexusReportForm branches={BRANCHES} categoryLabels={CATEGORY_LABELS} />);
  return { user };
}

describe("NexusReportForm", () => {
  it("announces the demonstration before anything is typed", () => {
    setup();
    expect(screen.getByText(/nothing is sent or stored/i)).toBeInTheDocument();
  });

  it("shows accessible errors and focuses the first invalid field on an empty submit", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /file the declaration/i }));
    const callsign = screen.getByLabelText(/analyst callsign/i);
    expect(callsign).toHaveAttribute("aria-invalid", "true");
    expect(callsign).toHaveFocus();
    const errorId = callsign.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!.split(" ").pop()!)).toHaveTextContent(/callsign/i);
    expect(screen.getAllByRole("status").at(-1)).toHaveTextContent(/fields need attention/i);
  });

  it("clears an error as the field is corrected after the first attempt", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /file the declaration/i }));
    const callsign = screen.getByLabelText(/analyst callsign/i);
    await user.type(callsign, "Desk-07");
    expect(callsign).not.toHaveAttribute("aria-invalid");
  });

  it("files a valid report as a demonstration receipt, without sending anything", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/analyst callsign/i), "Desk-07");
    await user.selectOptions(screen.getByLabelText(/observed on branch/i), "BR-1962-A");
    await user.selectOptions(screen.getByLabelText(/event category/i), "temporal");
    await user.click(screen.getByRole("radio", { name: /critical/i }));
    await user.type(
      screen.getByLabelText(/what did you observe/i),
      "The same clerk stamped the same form twice, forty seconds apart, with two different dates.",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /file the declaration/i }));

    expect(screen.getByRole("heading", { name: /nexus event logged, locally/i })).toHaveFocus();
    expect(screen.getAllByText(/NX-BR19-\d{4}/).length).toBeGreaterThan(0);
    expect(screen.getByText(/was not sent, stored or shared/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /file another/i }));
    expect(screen.getByLabelText(/analyst callsign/i)).toHaveValue("");
  });
});
