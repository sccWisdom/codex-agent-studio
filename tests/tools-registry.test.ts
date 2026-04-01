import { describe, expect, it } from "vitest";
import { getRegisteredTools } from "@/lib/tools/registered-tools";

describe("registered tools", () => {
  it("contains the three MVP tool categories", () => {
    const tools = getRegisteredTools();
    const names = tools.map((tool) => tool.name);

    expect(names).toContain("knowledge_search");
    expect(names).toContain("extract_structured_items");
    expect(names).toContain("mock_data_lookup");
    expect(tools.length).toBeGreaterThanOrEqual(3);
  });

  it("executes structured extraction tool", async () => {
    const tools = getRegisteredTools();
    const tool = tools.find((item) => item.name === "extract_structured_items");

    if (!tool) {
      throw new Error("structured tool missing");
    }

    const result = await tool.execute({
      text: "first item. second item. third item.",
      maxItems: 2,
    });

    expect(result.outputSummary).toContain("Generated");
    expect(Array.isArray(result.output.items)).toBe(true);
  });

  it("returns deterministic value for mock lookup", async () => {
    const tools = getRegisteredTools();
    const tool = tools.find((item) => item.name === "mock_data_lookup");

    if (!tool) {
      throw new Error("mock tool missing");
    }

    const result = await tool.execute({ key: "release_version" });

    expect(result.outputSummary).toContain("release_version");
    expect(result.output.key).toBe("release_version");
  });
});
