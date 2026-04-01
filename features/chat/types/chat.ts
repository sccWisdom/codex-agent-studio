export type SessionListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ChatMessageItem = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: string;
};

export type ToolCallItem = {
  id: string;
  runId: string;
  toolName: string;
  inputSummary: string;
  outputSummary: string | null;
  status: "running" | "success" | "failed";
  startedAt: string;
  endedAt: string | null;
};

export type RunItem = {
  id: string;
  sessionId: string;
  userMessageId: string | null;
  status: "running" | "success" | "failed";
  startedAt: string;
  endedAt: string | null;
  errorMessage: string | null;
  toolCalls: ToolCallItem[];
};
