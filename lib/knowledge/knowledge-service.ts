import { db } from "@/lib/db/client";
import { getRegisteredTools } from "@/lib/tools/registered-tools";

export type KnowledgeSourceItem = {
  id: string;
  name: string;
  type: string;
  contentPreview: string;
  createdAt: Date;
};

function preview(text: string, max = 140): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max)}...`;
}

export async function listKnowledgeSources(): Promise<KnowledgeSourceItem[]> {
  const items = await db.knowledgeSource.findMany({
    where: {
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      type: true,
      content: true,
      createdAt: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    contentPreview: preview(item.content ?? ""),
    createdAt: item.createdAt,
  }));
}

export async function createKnowledgeSource(input: {
  name: string;
  type: string;
  content: string;
}) {
  const created = await db.knowledgeSource.create({
    data: {
      name: input.name,
      type: input.type,
      content: input.content,
      status: "active",
    },
    select: {
      id: true,
      name: true,
      type: true,
      content: true,
      createdAt: true,
    },
  });

  return {
    id: created.id,
    name: created.name,
    type: created.type,
    contentPreview: preview(created.content ?? ""),
    createdAt: created.createdAt,
  };
}

export async function deleteKnowledgeSource(sourceId: string): Promise<boolean> {
  const result = await db.knowledgeSource.deleteMany({
    where: {
      id: sourceId,
    },
  });

  return result.count > 0;
}

export async function runKnowledgeSearch(query: string, limit = 5) {
  const tool = getRegisteredTools().find((item) => item.name === "knowledge_search");
  if (!tool) {
    throw new Error("knowledge_search tool is not registered.");
  }

  const result = await tool.execute({ query, limit });
  return {
    summary: result.outputSummary,
    result: result.output,
  };
}
