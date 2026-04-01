import { db } from "@/lib/db/client";
import {
  DEFAULT_SESSION_TITLE,
  type ChatStore,
  type SessionSummary,
  type SessionWithMessages,
  type StoredMessage,
  type StoredRun,
  type StoredToolCall,
} from "@/lib/chat/chat-service";

function mapSessionSummary(input: {
  id: string;
  title: string;
  updatedAt: Date;
}): SessionSummary {
  return {
    id: input.id,
    title: input.title,
    updatedAt: input.updatedAt,
  };
}

function mapMessage(input: {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
}): StoredMessage {
  return {
    id: input.id,
    sessionId: input.sessionId,
    role: input.role,
    content: input.content,
    createdAt: input.createdAt,
  };
}

function mapToolCall(input: {
  id: string;
  runId: string;
  toolName: string;
  inputSummary: string;
  outputSummary: string | null;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
}): StoredToolCall {
  return {
    id: input.id,
    runId: input.runId,
    toolName: input.toolName,
    inputSummary: input.inputSummary,
    outputSummary: input.outputSummary,
    status: input.status as StoredToolCall["status"],
    startedAt: input.startedAt,
    endedAt: input.endedAt,
  };
}

function mapRun(input: {
  id: string;
  sessionId: string;
  userMessageId: string | null;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  toolCalls: {
    id: string;
    runId: string;
    toolName: string;
    inputSummary: string;
    outputSummary: string | null;
    status: string;
    startedAt: Date;
    endedAt: Date | null;
  }[];
}): StoredRun {
  return {
    id: input.id,
    sessionId: input.sessionId,
    userMessageId: input.userMessageId,
    status: input.status as StoredRun["status"],
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    errorMessage: input.errorMessage,
    toolCalls: input.toolCalls.map(mapToolCall),
  };
}

export class PrismaChatStore implements ChatStore {
  async createSession() {
    const created = await db.session.create({
      data: {
        title: DEFAULT_SESSION_TITLE,
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return mapSessionSummary(created);
  }

  async listSessions() {
    const sessions = await db.session.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return sessions.map(mapSessionSummary);
  }

  async getSessionWithMessages(sessionId: string): Promise<SessionWithMessages | null> {
    const session = await db.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages.map(mapMessage),
    };
  }

  async createMessage(input: {
    sessionId: string;
    role: string;
    content: string;
  }): Promise<StoredMessage> {
    const message = await db.message.create({
      data: {
        sessionId: input.sessionId,
        role: input.role,
        content: input.content,
      },
      select: {
        id: true,
        sessionId: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    await db.session.update({
      where: {
        id: input.sessionId,
      },
      data: {
        updatedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    return mapMessage(message);
  }

  async updateSessionTitle(sessionId: string, title: string) {
    await db.session.update({
      where: {
        id: sessionId,
      },
      data: {
        title,
      },
      select: {
        id: true,
      },
    });
  }

  async createRun(input: { sessionId: string; userMessageId: string }) {
    const run = await db.run.create({
      data: {
        sessionId: input.sessionId,
        userMessageId: input.userMessageId,
        status: "running",
      },
      select: {
        id: true,
      },
    });

    return run;
  }

  async finishRun(
    runId: string,
    input: { status: "success" | "failed"; errorMessage?: string | null },
  ) {
    await db.run.update({
      where: {
        id: runId,
      },
      data: {
        status: input.status,
        errorMessage: input.errorMessage ?? null,
        endedAt: new Date(),
      },
      select: {
        id: true,
      },
    });
  }

  async createToolCall(input: {
    runId: string;
    toolName: string;
    inputSummary: string;
    startedAt?: Date;
  }) {
    const toolCall = await db.toolCall.create({
      data: {
        runId: input.runId,
        toolName: input.toolName,
        inputSummary: input.inputSummary,
        status: "running",
        startedAt: input.startedAt ?? new Date(),
      },
      select: {
        id: true,
      },
    });

    return toolCall;
  }

  async finishToolCall(
    toolCallId: string,
    input: {
      status: "success" | "failed";
      outputSummary: string;
      endedAt?: Date;
    },
  ) {
    await db.toolCall.update({
      where: {
        id: toolCallId,
      },
      data: {
        status: input.status,
        outputSummary: input.outputSummary,
        endedAt: input.endedAt ?? new Date(),
      },
      select: {
        id: true,
      },
    });
  }

  async listRunsBySession(sessionId: string, limit = 20): Promise<StoredRun[]> {
    const runs = await db.run.findMany({
      where: {
        sessionId,
      },
      include: {
        toolCalls: {
          orderBy: {
            startedAt: "asc",
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: limit,
    });

    return runs.map(mapRun);
  }

  async getRunById(runId: string): Promise<StoredRun | null> {
    const run = await db.run.findUnique({
      where: {
        id: runId,
      },
      include: {
        toolCalls: {
          orderBy: {
            startedAt: "asc",
          },
        },
      },
    });

    if (!run) {
      return null;
    }

    return mapRun(run);
  }
}
