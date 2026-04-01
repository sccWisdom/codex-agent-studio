import { describe, expect, it } from "vitest";
import { isRunStatus, normalizeRunListLimit } from "@/lib/runs/run-service";

describe("run service helpers", () => {
  it("accepts only valid run status values", () => {
    expect(isRunStatus("running")).toBe(true);
    expect(isRunStatus("success")).toBe(true);
    expect(isRunStatus("failed")).toBe(true);
    expect(isRunStatus("unknown")).toBe(false);
  });

  it("normalizes run list limit within safe range", () => {
    expect(normalizeRunListLimit(undefined)).toBe(30);
    expect(normalizeRunListLimit(5)).toBe(5);
    expect(normalizeRunListLimit(0)).toBe(1);
    expect(normalizeRunListLimit(999)).toBe(100);
  });
});
