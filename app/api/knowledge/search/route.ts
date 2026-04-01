import { NextResponse } from "next/server";
import { runKnowledgeSearch } from "@/lib/knowledge/knowledge-service";

type SearchBody = {
  query?: string;
  limit?: number;
};

export async function POST(request: Request) {
  let body: SearchBody;
  try {
    body = (await request.json()) as SearchBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid search request body.",
      },
      { status: 400 },
    );
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json(
      {
        error: "Search query cannot be empty.",
      },
      { status: 400 },
    );
  }

  const limit = typeof body.limit === "number" ? body.limit : 5;

  try {
    const payload = await runKnowledgeSearch(query, limit);
    return NextResponse.json(payload);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Search failed: ${detail}`,
      },
      { status: 500 },
    );
  }
}
