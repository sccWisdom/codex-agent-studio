import { NextResponse } from "next/server";
import {
  createKnowledgeSource,
  listKnowledgeSources,
} from "@/lib/knowledge/knowledge-service";
import {
  KnowledgeFileValidationError,
  parseKnowledgeFile,
} from "@/lib/knowledge/knowledge-file";

export async function GET() {
  try {
    const sources = await listKnowledgeSources();
    return NextResponse.json({ sources });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to load knowledge list: ${detail}`,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let file: File | null = null;

  try {
    const formData = await request.formData();
    const candidate = formData.get("file");
    if (candidate instanceof File) {
      file = candidate;
    }
  } catch {
    return NextResponse.json(
      {
        error: "Invalid upload request body.",
      },
      { status: 400 },
    );
  }

  if (!file) {
    return NextResponse.json(
      {
        error: "Missing file field.",
      },
      { status: 400 },
    );
  }

  try {
    const parsed = await parseKnowledgeFile(file);
    const source = await createKnowledgeSource({
      name: parsed.name,
      type: parsed.type,
      content: parsed.content,
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    if (error instanceof KnowledgeFileValidationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to save knowledge source: ${detail}`,
      },
      { status: 500 },
    );
  }
}
