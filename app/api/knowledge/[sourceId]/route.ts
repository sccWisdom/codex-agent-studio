import { NextResponse } from "next/server";
import { deleteKnowledgeSource } from "@/lib/knowledge/knowledge-service";

type RouteContext = {
  params: Promise<{ sourceId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const { sourceId } = await context.params;

  try {
    const deleted = await deleteKnowledgeSource(sourceId);

    if (!deleted) {
      return NextResponse.json(
        {
          error: "Knowledge source not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to delete knowledge source: ${detail}`,
      },
      { status: 500 },
    );
  }
}
