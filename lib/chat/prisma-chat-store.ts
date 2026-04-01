import { db } from "@/lib/db/client";
import {
  DEFAULT_SESSION_TITLE,
  type ChatStore,
  type SessionSummary,
  type SessionWithMessages,
  type StoredMessage,
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

    // Keep session ordering by the latest chat activity.
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
}
