import { describe, expect, it } from "vitest";
import { mainNavItems } from "@/lib/config/navigation";

describe("mainNavItems", () => {
  it("contains required MVP workspace pages", () => {
    const paths = mainNavItems.map((item) => item.href);

    expect(paths).toEqual([
      "/",
      "/chat",
      "/knowledge",
      "/runs",
      "/settings",
    ]);
  });
});

