import { describe, expect, it } from "vitest";
import { createResponsesAgent } from "@/lib/agent/responses-agent";

describe("responses agent", () => {
  it("returns clear error when OPENAI_API_KEY is missing", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const agent = createResponsesAgent();
      await expect(agent.reply([{ role: "user", content: "hello" }])).rejects.toThrow(
        "OPENAI_API_KEY is not configured.",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previous;
      }
    }
  });
});
