import { describe, expect, it } from "vitest";
import { caseNumber, validateNexusReport, type NexusReportInput } from "@/lib/validation";

const BRANCHES = ["SL-0", "BR-1962-A", "BR-2301-K"];

const valid: NexusReportInput = {
  callsign: "Analyst-07",
  branchId: "BR-1962-A",
  category: "temporal",
  severity: "moderate",
  description: "Observed a second instance of the same variant at the archive desk, forty seconds apart.",
  acknowledged: true,
};

describe("validateNexusReport", () => {
  it("accepts a complete report and returns it typed", () => {
    const { errors, report } = validateNexusReport(valid, BRANCHES);
    expect(errors).toEqual({});
    expect(report).toMatchObject({ callsign: "Analyst-07", branchId: "BR-1962-A", severity: "moderate" });
  });

  it("trims whitespace before judging length", () => {
    const { report } = validateNexusReport({ ...valid, callsign: "  Analyst-07  " }, BRANCHES);
    expect(report?.callsign).toBe("Analyst-07");
  });

  it("rejects an empty callsign with a readable message", () => {
    const { errors } = validateNexusReport({ ...valid, callsign: "" }, BRANCHES);
    expect(errors.callsign).toMatch(/callsign/i);
  });

  it("rejects callsigns with other characters", () => {
    const { errors } = validateNexusReport({ ...valid, callsign: "mob ius!" }, BRANCHES);
    expect(errors.callsign).toBeDefined();
  });

  it("rejects a branch that is not on file", () => {
    const { errors } = validateNexusReport({ ...valid, branchId: "BR-9999" }, BRANCHES);
    expect(errors.branchId).toMatch(/not on file/i);
  });

  it("requires a known category and severity", () => {
    const { errors } = validateNexusReport({ ...valid, category: "weird", severity: "" }, BRANCHES);
    expect(errors.category).toBeDefined();
    expect(errors.severity).toBeDefined();
  });

  it("requires a description between 20 and 600 characters", () => {
    expect(validateNexusReport({ ...valid, description: "too short" }, BRANCHES).errors.description).toMatch(/20/);
    expect(
      validateNexusReport({ ...valid, description: "x".repeat(601) }, BRANCHES).errors.description,
    ).toMatch(/600/);
  });

  it("requires the demonstration acknowledgement", () => {
    const { errors, report } = validateNexusReport({ ...valid, acknowledged: false }, BRANCHES);
    expect(errors.acknowledged).toBeDefined();
    expect(report).toBeNull();
  });

  it("collects every error at once", () => {
    const { errors } = validateNexusReport(
      { callsign: "", branchId: "", category: "", severity: "", description: "", acknowledged: false },
      BRANCHES,
    );
    expect(Object.keys(errors).sort()).toEqual(
      ["acknowledged", "branchId", "callsign", "category", "description", "severity"].sort(),
    );
  });
});

describe("caseNumber", () => {
  it("is stable for the same report and carries the branch", () => {
    const { report } = validateNexusReport(valid, BRANCHES);
    if (!report) throw new Error("expected a report");
    expect(caseNumber(report)).toBe(caseNumber(report));
    expect(caseNumber(report)).toMatch(/^NX-BR19-\d{4}$/);
  });
});
