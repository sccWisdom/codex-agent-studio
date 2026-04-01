import { db } from "@/lib/db/client";

export type RunStatus = "running" | "success" | "failed";

export type RunListItem = {
  id: string;
  status: RunStatus;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  sessionId: string;
  sessionTitle: string;
  userMessagePreview: string | null;
  toolCallCount: number;
};

export type RunDetailItem = {
  id: string;
  status: RunStatus;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  sessionId: string;
  sessionTitle: string;
  userMessage: {
    id: string;
    content: string;
    createdAt: Date;
  } | null;
  toolCalls: {
    id: string;
    toolName: string;
    inputSummary: string;
    outputSummary: string | null;
    status: RunStatus;
    startedAt: Date;
    endedAt: Date | null;
  }[];
};

export type ListRunsInput = {
  status?: RunStatus;
  limit?: number;
};

export function isRunStatus(value: string): value is RunStatus {
  return value === "running" || value === "success" || value === "failed";
}

export function normalizeRunListLimit(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) {
    return 30;
  }
  const normalized = Math.floor(value);
  if (normalized < 1) {
    return 1;
  }
  if (normalized > 100) {
    return 100;
  }
  return normalized;
}

function preview(content: string | null, max = 80): string | null {
  if (!content) {
    return null;
  }
  const compact = content.replace(/\s+/g, " ").trim();
  if (!compact) {
    return null;
  }
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max)}...`;
}

export async function listRuns(input: ListRunsInput = {}): Promise<RunListItem[]> {
  const where = input.status
    ? {
        status: input.status,
      }
    : undefined;

  const runs = await db.run.findMany({
    where,
    orderBy: {
      startedAt: "desc",
    },
    take: normalizeRunListLimit(input.limit),
    include: {
      session: {
        select: {
          id: true,
          title: true,
        },
      },
      userMessage: {
        select: {
          content: true,
        },
      },
      _count: {
        select: {
          toolCalls: true,
        },
      },
    },
  });

  return runs.map((run) => ({
    id: run.id,
    status: run.status as RunStatus,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    errorMessage: run.errorMessage,
    sessionId: run.session.id,
    sessionTitle: run.session.title,
    userMessagePreview: preview(run.userMessage?.content ?? null),
    toolCallCount: run._count.toolCalls,
  }));
}

export async function getRunDetail(runId: string): Promise<RunDetailItem | null> {
  const run = await db.run.findUnique({
    where: {
      id: runId,
    },
    include: {
      session: {
        select: {
          id: true,
          title: true,
        },
      },
      userMessage: {
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      },
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

  return {
    id: run.id,
    status: run.status as RunStatus,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    errorMessage: run.errorMessage,
    sessionId: run.session.id,
    sessionTitle: run.session.title,
    userMessage: run.userMessage
      ? {
          id: run.userMessage.id,
          content: run.userMessage.content,
          createdAt: run.userMessage.createdAt,
        }
      : null,
    toolCalls: run.toolCalls.map((toolCall) => ({
      id: toolCall.id,
      toolName: toolCall.toolName,
      inputSummary: toolCall.inputSummary,
      outputSummary: toolCall.outputSummary,
      status: toolCall.status as RunStatus,
      startedAt: toolCall.startedAt,
      endedAt: toolCall.endedAt,
    })),
  };
}
