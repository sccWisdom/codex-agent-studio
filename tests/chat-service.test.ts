import { describe, expect, it } from "vitest";
import {
  ChatAgentError,
  DEFAULT_SESSION_TITLE,
  createChatService,
  type ChatStore,
  type StoredMessage,
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

  private sequence = 0;
  private messageSequence = 0;

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

  it("stores user and assistant messages and auto-updates title from first user message", async () => {
    const store = new InMemoryStore();
    const service = createChatService({
      store,
      agent: {
        async reply() {
          return "Assistant answer";
        },
      },
    });

    const session = await service.createSession();
    const result = await service.sendMessage(
      session.id,
      "How do I set up this project for local run?",
    );

    expect(result.userMessage.role).toBe("user");
    expect(result.assistantMessage.role).toBe("assistant");
    expect(result.assistantMessage.content).toBe("Assistant answer");

    const hydrated = await service.getSessionWithMessages(session.id);
    expect(hydrated?.messages).toHaveLength(2);
    expect(hydrated?.title).toContain("How do I set up");
  });

  it("throws a chat error when agent request fails but keeps the user message persisted", async () => {
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
  });
});
