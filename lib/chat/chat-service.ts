export const DEFAULT_SESSION_TITLE = "New Session";

export type RunStatus = "running" | "success" | "failed";
export type ToolCallStatus = "running" | "success" | "failed";

export type StoredMessage = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
};

export type StoredToolCall = {
  id: string;
  runId: string;
  toolName: string;
  inputSummary: string;
  outputSummary: string | null;
  status: ToolCallStatus;
  startedAt: Date;
  endedAt: Date | null;
};

export type StoredRun = {
  id: string;
  sessionId: string;
  userMessageId: string | null;
  status: RunStatus;
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  toolCalls: StoredToolCall[];
};

export type SessionSummary = {
  id: string;
  title: string;
  updatedAt: Date;
};

export type SessionWithMessages = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: StoredMessage[];
};

export type AgentInputMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ToolLifecycleHooks = {
  onToolStart?: (input: {
    callId: string;
    toolName: string;
    inputSummary: string;
    startedAt: Date;
  }) => Promise<void> | void;
  onToolEnd?: (input: {
    callId: string;
    status: Exclude<ToolCallStatus, "running">;
    outputSummary: string;
    endedAt: Date;
  }) => Promise<void> | void;
};

export interface ChatStore {
  createSession(): Promise<SessionSummary>;
  listSessions(): Promise<SessionSummary[]>;
  getSessionWithMessages(sessionId: string): Promise<SessionWithMessages | null>;
  createMessage(input: {
    sessionId: string;
    role: string;
    content: string;
  }): Promise<StoredMessage>;
  updateSessionTitle(sessionId: string, title: string): Promise<void>;
  createRun(input: { sessionId: string; userMessageId: string }): Promise<{ id: string }>;
  finishRun(
    runId: string,
    input: { status: Exclude<RunStatus, "running">; errorMessage?: string | null },
  ): Promise<void>;
  createToolCall(input: {
    runId: string;
    toolName: string;
    inputSummary: string;
    startedAt?: Date;
  }): Promise<{ id: string }>;
  finishToolCall(
    toolCallId: string,
    input: {
      status: Exclude<ToolCallStatus, "running">;
      outputSummary: string;
      endedAt?: Date;
    },
  ): Promise<void>;
  listRunsBySession(sessionId: string, limit?: number): Promise<StoredRun[]>;
  getRunById(runId: string): Promise<StoredRun | null>;
}

export interface ChatAgent {
  reply(messages: AgentInputMessage[], hooks?: ToolLifecycleHooks): Promise<string>;
}

export class ChatValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatValidationError";
  }
}

export class ChatNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatNotFoundError";
  }
}

export class ChatAgentError extends Error {
  userMessage: StoredMessage;
  run: StoredRun | null;

  constructor(
    message: string,
    userMessage: StoredMessage,
    run: StoredRun | null,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "ChatAgentError";
    this.userMessage = userMessage;
    this.run = run;
  }
}

function toAgentRole(role: string): AgentInputMessage["role"] {
  if (role === "assistant") {
    return "assistant";
  }
  if (role === "system") {
    return "system";
  }
  return "user";
}

function generateSessionTitle(input: string): string {
  const compact = input.trim().replace(/\s+/g, " ");
  if (!compact) {
    return DEFAULT_SESSION_TITLE;
  }
  return compact.length <= 50 ? compact : `${compact.slice(0, 50)}...`;
}

export function createChatService(deps: { store: ChatStore; agent: ChatAgent }) {
  const { store, agent } = deps;

  return {
    async createSession() {
      return store.createSession();
    },

    async listSessions() {
      return store.listSessions();
    },

    async getSessionWithMessages(sessionId: string) {
      return store.getSessionWithMessages(sessionId);
    },

    async listRunsBySession(sessionId: string, limit = 20) {
      return store.listRunsBySession(sessionId, limit);
    },

    async sendMessage(sessionId: string, content: string) {
      const normalizedContent = content.trim();
      if (!normalizedContent) {
        throw new ChatValidationError("Message content cannot be empty.");
      }

      const session = await store.getSessionWithMessages(sessionId);
      if (!session) {
        throw new ChatNotFoundError("Session not found.");
      }

      const userMessage = await store.createMessage({
        sessionId,
        role: "user",
        content: normalizedContent,
      });

      const run = await store.createRun({
        sessionId,
        userMessageId: userMessage.id,
      });

      const toolCallMap = new Map<string, string>();

      const context = [...session.messages, userMessage].map((item) => ({
        role: toAgentRole(item.role),
        content: item.content,
      }));

      let assistantOutput: string;
      try {
        assistantOutput = await agent.reply(context, {
          onToolStart: async (input) => {
            const created = await store.createToolCall({
              runId: run.id,
              toolName: input.toolName,
              inputSummary: input.inputSummary,
              startedAt: input.startedAt,
            });
            toolCallMap.set(input.callId, created.id);
          },
          onToolEnd: async (input) => {
            const toolCallId = toolCallMap.get(input.callId);
            if (!toolCallId) {
              return;
            }
            await store.finishToolCall(toolCallId, {
              status: input.status,
              outputSummary: input.outputSummary,
              endedAt: input.endedAt,
            });
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Agent request failed.";
        await store.finishRun(run.id, {
          status: "failed",
          errorMessage: message,
        });
        const failedRun = await store.getRunById(run.id);
        throw new ChatAgentError(message, userMessage, failedRun, { cause: error });
      }

      const assistantContent = assistantOutput.trim() || "I could not generate a response.";

      const assistantMessage = await store.createMessage({
        sessionId,
        role: "assistant",
        content: assistantContent,
      });

      if (session.title === DEFAULT_SESSION_TITLE) {
        await store.updateSessionTitle(sessionId, generateSessionTitle(normalizedContent));
      }

      await store.finishRun(run.id, {
        status: "success",
      });

      const completedRun = await store.getRunById(run.id);

      return {
        userMessage,
        assistantMessage,
        run: completedRun,
      };
    },
  };
}

