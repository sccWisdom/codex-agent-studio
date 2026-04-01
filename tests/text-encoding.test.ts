import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const roots = ["app", "components", "features", "lib", "docs", "README.md", ".env.example"];
const suspiciousMarkers = ["\uFFFD", "ï¿", "â€"];
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".yml",
  ".yaml",
  ".txt",
  ".env",
  ".example",
]);

function isTextFile(file: string): boolean {
  const ext = path.extname(file).toLowerCase();
  if (textExtensions.has(ext)) {
    return true;
  }

  const base = path.basename(file).toLowerCase();
  return base === ".env" || base.endsWith(".env") || base.endsWith(".env.example");
}

function collectFiles(entry: string): string[] {
  const target = path.resolve(process.cwd(), entry);
  if (!fs.existsSync(target)) {
    return [];
  }

  const stat = fs.statSync(target);
  if (stat.isFile()) {
    return isTextFile(target) ? [target] : [];
  }

  const result: string[] = [];
  const stack = [target];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const name of fs.readdirSync(current)) {
      const next = path.join(current, name);
      const nextStat = fs.statSync(next);
      if (nextStat.isDirectory()) {
        stack.push(next);
      } else if (isTextFile(next)) {
        result.push(next);
      }
    }
  }

  return result;
}

describe("text encoding smoke", () => {
  it("has no common mojibake markers in key source/docs files", () => {
    const files = roots.flatMap(collectFiles);
    const findings: Array<{ file: string; marker: string }> = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      for (const marker of suspiciousMarkers) {
        if (content.includes(marker)) {
          findings.push({ file, marker });
        }
      }
    }

    expect(findings).toEqual([]);
  });
});
