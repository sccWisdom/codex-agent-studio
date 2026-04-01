export const DEFAULT_SESSION_TITLE = "New Session";

export type StoredMessage = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
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
}

export interface ChatAgent {
  reply(messages: AgentInputMessage[]): Promise<string>;
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

  constructor(message: string, userMessage: StoredMessage, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ChatAgentError";
    this.userMessage = userMessage;
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

      const context = [...session.messages, userMessage].map((item) => ({
        role: toAgentRole(item.role),
        content: item.content,
      }));

      let assistantOutput: string;
      try {
        assistantOutput = await agent.reply(context);
      } catch (error) {
        throw new ChatAgentError("Agent request failed.", userMessage, { cause: error });
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

      return {
        userMessage,
        assistantMessage,
      };
    },
  };
}
