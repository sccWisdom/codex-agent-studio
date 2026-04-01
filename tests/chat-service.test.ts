import { describe, expect, it } from "vitest";
import {
  ChatAgentError,
  DEFAULT_SESSION_TITLE,
  createChatService,
  type ChatStore,
  type StoredMessage,
  type StoredRun,
  type StoredToolCall,
} from "@/lib/chat/chat-service";

class InMemoryStore implements ChatStore {
  private sessions = new Map<
    string,
    {
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      messages: StoredMessage[];
    }
  >();

  private runs = new Map<string, StoredRun>();
  private toolCalls = new Map<string, StoredToolCall>();

  private sequence = 0;
  private messageSequence = 0;
  private runSequence = 0;
  private toolCallSequence = 0;

  async createSession() {
    const id = `session-${++this.sequence}`;
    const now = new Date();
    const session = {
      id,
      title: DEFAULT_SESSION_TITLE,
      createdAt: now,
      updatedAt: now,
      messages: [] as StoredMessage[],
    };
    this.sessions.set(id, session);
    return { id: session.id, title: session.title, updatedAt: session.updatedAt };
  }

  async listSessions() {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((item) => ({ id: item.id, title: item.title, updatedAt: item.updatedAt }));
  }

  async getSessionWithMessages(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: [...session.messages],
    };
  }

  async createMessage(input: { sessionId: string; role: string; content: string }) {
    const session = this.sessions.get(input.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const message = {
      id: `message-${++this.messageSequence}`,
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      createdAt: new Date(),
    };

    session.messages.push(message);
    session.updatedAt = new Date();
    return message;
  }

  async updateSessionTitle(sessionId: string, title: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    session.title = title;
    session.updatedAt = new Date();
  }

  async createRun(input: { sessionId: string; userMessageId: string }) {
    const run: StoredRun = {
      id: `run-${++this.runSequence}`,
      sessionId: input.sessionId,
      userMessageId: input.userMessageId,
      status: "running",
      startedAt: new Date(),
      endedAt: null,
      errorMessage: null,
      toolCalls: [],
    };
    this.runs.set(run.id, run);
    return { id: run.id };
  }

  async finishRun(
    runId: string,
    input: { status: "success" | "failed"; errorMessage?: string | null },
  ) {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error("Run not found");
    }
    run.status = input.status;
    run.endedAt = new Date();
    run.errorMessage = input.errorMessage ?? null;
  }

  async createToolCall(input: {
    runId: string;
    toolName: string;
    inputSummary: string;
    startedAt?: Date;
  }) {
    const toolCall: StoredToolCall = {
      id: `tool-${++this.toolCallSequence}`,
      runId: input.runId,
      toolName: input.toolName,
      inputSummary: input.inputSummary,
      outputSummary: null,
      status: "running",
      startedAt: input.startedAt ?? new Date(),
      endedAt: null,
    };

    this.toolCalls.set(toolCall.id, toolCall);
    const run = this.runs.get(input.runId);
    if (!run) {
      throw new Error("Run not found");
    }
    run.toolCalls.push(toolCall);

    return { id: toolCall.id };
  }

  async finishToolCall(
    toolCallId: string,
    input: {
      status: "success" | "failed";
      outputSummary: string;
      endedAt?: Date;
    },
  ) {
    const toolCall = this.toolCalls.get(toolCallId);
    if (!toolCall) {
      throw new Error("ToolCall not found");
    }

    toolCall.status = input.status;
    toolCall.outputSummary = input.outputSummary;
    toolCall.endedAt = input.endedAt ?? new Date();
  }

  async listRunsBySession(sessionId: string) {
    return Array.from(this.runs.values())
      .filter((run) => run.sessionId === sessionId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .map((run) => ({
        ...run,
        toolCalls: [...run.toolCalls],
      }));
  }

  async getRunById(runId: string) {
    const run = this.runs.get(runId);
    if (!run) {
      return null;
    }
    return {
      ...run,
      toolCalls: [...run.toolCalls],
    };
  }
}

describe("createChatService", () => {
  it("creates a session with default title", async () => {
    const store = new InMemoryStore();
    const service = createChatService({
      store,
      agent: {
        async reply() {
          return "ignored";
        },
      },
    });

    const session = await service.createSession();

    expect(session.title).toBe(DEFAULT_SESSION_TITLE);
    expect(session.id).toMatch(/^session-/);
  });

  it("stores run and tool call logs when tools are used", async () => {
    const store = new InMemoryStore();
    const service = createChatService({
      store,
      agent: {
        async reply(_messages, hooks) {
          await hooks?.onToolStart?.({
            callId: "tool-call-1",
            toolName: "knowledge_search",
            inputSummary: "query=deployment",
            startedAt: new Date(),
          });
          await hooks?.onToolEnd?.({
            callId: "tool-call-1",
            status: "success",
            outputSummary: "2 matches",
            endedAt: new Date(),
          });

          await hooks?.onToolStart?.({
            callId: "tool-call-2",
            toolName: "mock_lookup",
            inputSummary: "key=release",
            startedAt: new Date(),
          });
          await hooks?.onToolEnd?.({
            callId: "tool-call-2",
            status: "failed",
            outputSummary: "not found",
            endedAt: new Date(),
          });

          return "Assistant answer";
        },
      },
    });

    const session = await service.createSession();
    const result = await service.sendMessage(session.id, "Need deployment details");

    expect(result.run?.status).toBe("success");
    expect(result.run?.toolCalls).toHaveLength(2);
    expect(result.run?.toolCalls[0].toolName).toBe("knowledge_search");
    expect(result.run?.toolCalls[0].status).toBe("success");
    expect(result.run?.toolCalls[1].status).toBe("failed");
  });

  it("marks run as failed when agent request fails but keeps user message persisted", async () => {
    const store = new InMemoryStore();
    const service = createChatService({
      store,
      agent: {
        async reply() {
          throw new Error("upstream failure");
        },
      },
    });

    const session = await service.createSession();

    await expect(
      service.sendMessage(session.id, "Message before failure"),
    ).rejects.toBeInstanceOf(ChatAgentError);

    const hydrated = await service.getSessionWithMessages(session.id);
    expect(hydrated?.messages).toHaveLength(1);
    expect(hydrated?.messages[0].role).toBe("user");

    const runs = await store.listRunsBySession(session.id);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("failed");
  });
});
