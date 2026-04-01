import { NextResponse } from "next/server";
import { createRuntimeChatService } from "@/lib/chat/chat-runtime";

export async function GET() {
  try {
    const service = createRuntimeChatService();
    const sessions = await service.listSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to load sessions: ${detail}`,
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const service = createRuntimeChatService();
    const session = await service.createSession();
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: `Failed to create session: ${detail}`,
      },
      { status: 500 },
    );
  }
}
