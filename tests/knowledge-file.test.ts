import { describe, expect, it } from "vitest";
import {
  KnowledgeFileValidationError,
  parseKnowledgeFile,
} from "@/lib/knowledge/knowledge-file";

describe("parseKnowledgeFile", () => {
  it("accepts txt files and returns normalized metadata", async () => {
    const file = new File(["hello knowledge"], "notes.txt", {
      type: "text/plain",
    });

    const result = await parseKnowledgeFile(file);

    expect(result.name).toBe("notes.txt");
    expect(result.type).toBe("txt");
    expect(result.content).toContain("hello knowledge");
  });

  it("accepts md files", async () => {
    const file = new File(["# title"], "guide.md", {
      type: "text/markdown",
    });

    const result = await parseKnowledgeFile(file);

    expect(result.type).toBe("md");
    expect(result.content).toContain("# title");
  });

  it("throws a clear error for unsupported file type", async () => {
    const file = new File(["binary"], "manual.pdf", {
      type: "application/pdf",
    });

    await expect(parseKnowledgeFile(file)).rejects.toBeInstanceOf(
      KnowledgeFileValidationError,
    );
  });
});
