import { NextResponse } from "next/server";
import {
  ChatAgentError,
  ChatNotFoundError,
  ChatValidationError,
} from "@/lib/chat/chat-service";
import { createRuntimeChatService } from "@/lib/chat/chat-runtime";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

type RequestBody = {
  content?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  try {
    const service = createRuntimeChatService();
    const result = await service.sendMessage(sessionId, body.content ?? "");
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ChatValidationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    if (error instanceof ChatNotFoundError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 404 },
      );
    }

    if (error instanceof ChatAgentError) {
      return NextResponse.json(
        {
          error: `Agent failed to reply: ${error.message}`,
          userMessage: error.userMessage,
          run: error.run,
        },
        { status: 502 },
      );
    }

    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to send message: ${detail}`,
      },
      { status: 500 },
    );
  }
}
