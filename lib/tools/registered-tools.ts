import { db } from "@/lib/db/client";

export type RegisteredTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  summarizeInput: (args: unknown) => string;
  execute: (args: unknown) => Promise<{
    output: Record<string, unknown>;
    outputSummary: string;
  }>;
};

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function truncate(text: string, max = 200): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max)}...`;
}

function toPositiveInt(input: unknown, fallback: number, max: number): number {
  const value = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.floor(value), 1), max);
}

const mockDataset: Record<string, string> = {
  release_version: "v0.3.0-preview",
  deployment_region: "local-staging",
  run_policy: "low-risk-tools-only",
  support_contact: "agent-studio-owner@example.com",
};

const knowledgeSearchTool: RegisteredTool = {
  name: "knowledge_search",
  description: "Search uploaded knowledge sources by text query.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search text",
      },
      limit: {
        type: "integer",
        description: "Max number of matches (1-5)",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  summarizeInput(args: unknown) {
    const input = asObject(args);
    const query = typeof input.query === "string" ? input.query : "";
    const limit = toPositiveInt(input.limit, 3, 5);
    return `query=${truncate(query, 80)}; limit=${limit}`;
  },
  async execute(args: unknown) {
    const input = asObject(args);
    const rawQuery = typeof input.query === "string" ? input.query.trim() : "";
    const limit = toPositiveInt(input.limit, 3, 5);

    if (!rawQuery) {
      throw new Error("query is required for knowledge_search.");
    }

    const sources = await db.knowledgeSource.findMany({
      where: {
        status: "active",
        OR: [
          { name: { contains: rawQuery } },
          { type: { contains: rawQuery } },
          { content: { contains: rawQuery } },
          { path: { contains: rawQuery } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const matches = sources.map((source) => {
      const text = source.content || source.path || "";
      return {
        sourceId: source.id,
        name: source.name,
        type: source.type,
        snippet: truncate(text, 180),
      };
    });

    return {
      output: {
        query: rawQuery,
        matches,
      },
      outputSummary:
        matches.length > 0
          ? `Found ${matches.length} knowledge matches.`
          : "No knowledge match found.",
    };
  },
};

const structuredExtractTool: RegisteredTool = {
  name: "extract_structured_items",
  description:
    "Extract a concise summary and list of key points from user-provided text.",
  parameters: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "Source text to process",
      },
      maxItems: {
        type: "integer",
        description: "Max list items (1-10)",
      },
    },
    required: ["text"],
    additionalProperties: false,
  },
  summarizeInput(args: unknown) {
    const input = asObject(args);
    const text = typeof input.text === "string" ? input.text : "";
    const maxItems = toPositiveInt(input.maxItems, 5, 10);
    return `text=${truncate(text, 80)}; maxItems=${maxItems}`;
  },
  async execute(args: unknown) {
    const input = asObject(args);
    const text = typeof input.text === "string" ? input.text.trim() : "";
    const maxItems = toPositiveInt(input.maxItems, 5, 10);

    if (!text) {
      throw new Error("text is required for extract_structured_items.");
    }

    const sentenceParts = text
      .split(/[\n\.。！？!?]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const list = sentenceParts.slice(0, maxItems).map((item) => truncate(item, 90));
    const summary = truncate(sentenceParts.slice(0, 3).join("; "), 180);

    return {
      output: {
        summary,
        items: list,
      },
      outputSummary: `Generated ${list.length} structured items.`,
    };
  },
};

const mockLookupTool: RegisteredTool = {
  name: "mock_data_lookup",
  description:
    "Read safe mock values for demo-only lookups without touching external systems.",
  parameters: {
    type: "object",
    properties: {
      key: {
        type: "string",
        description: "Mock data key, such as release_version",
      },
    },
    required: ["key"],
    additionalProperties: false,
  },
  summarizeInput(args: unknown) {
    const input = asObject(args);
    const key = typeof input.key === "string" ? input.key : "";
    return `key=${truncate(key, 60)}`;
  },
  async execute(args: unknown) {
    const input = asObject(args);
    const key = typeof input.key === "string" ? input.key.trim() : "";

    if (!key) {
      throw new Error("key is required for mock_data_lookup.");
    }

    const value = mockDataset[key];
    if (!value) {
      throw new Error(`mock key '${key}' not found.`);
    }

    return {
      output: {
        key,
        value,
        source: "mock-dataset",
      },
      outputSummary: `Resolved mock key '${key}'.`,
    };
  },
};

export function getRegisteredTools(): RegisteredTool[] {
  return [knowledgeSearchTool, structuredExtractTool, mockLookupTool];
}
