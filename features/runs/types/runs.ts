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
