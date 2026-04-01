import { describe, expect, it } from "vitest";
import { milestonePlan } from "@/lib/config/milestones";

describe("milestonePlan", () => {
  it("keeps MVP milestone sequence in order", () => {
    expect(milestonePlan.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("marks only first milestone as current at bootstrap stage", () => {
    const current = milestonePlan.filter((item) => item.status === "current");
    expect(current).toHaveLength(1);
    expect(current[0].id).toBe(1);
  });
});

