import { NextResponse } from "next/server";
import { chatStore } from "@/lib/chat/chat-runtime";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  try {
    const session = await chatStore.getSessionWithMessages(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          error: "Session not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to load session: ${detail}`,
      },
      { status: 500 },
    );
  }
}
