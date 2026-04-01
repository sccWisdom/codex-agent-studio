import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { ChatStatusPanel } from "@/features/chat/components/chat-status-panel";
import { SessionList } from "@/features/chat/components/session-list";
import type { ChatMessageItem, SessionListItem } from "@/features/chat/types/chat";
import { chatStore } from "@/lib/chat/chat-runtime";

type ChatSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

function serializeSessions(
  sessions: { id: string; title: string; updatedAt: Date }[],
): SessionListItem[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt.toISOString(),
  }));
}

function serializeMessages(
  messages: {
    id: string;
    sessionId: string;
    role: string;
    content: string;
    createdAt: Date;
  }[],
): ChatMessageItem[] {
  return messages.map((message) => ({
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;

  const [sessions, session] = await Promise.all([
    chatStore.listSessions(),
    chatStore.getSessionWithMessages(sessionId),
  ]);

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title={session ? session.title : "Session not found"}
          description="Messages are persisted in SQLite and restored on page reload."
        />

        <div className="grid gap-4 lg:grid-cols-[280px,1fr,300px]">
          <SessionList sessions={serializeSessions(sessions)} activeSessionId={sessionId} />

          {session ? (
            <ChatPanel
              sessionId={session.id}
              initialMessages={serializeMessages(session.messages)}
            />
          ) : (
            <Card className="flex min-h-[520px] items-center justify-center p-6">
              <div className="max-w-md text-center">
                <h2 className="text-lg font-semibold text-zinc-900">Session does not exist</h2>
                <p className="mt-2 text-sm text-zinc-600">
                  This session may have been removed. Please create a new one from the left panel.
                </p>
              </div>
            </Card>
          )}

          <ChatStatusPanel status={session ? "ready" : "idle"} />
        </div>
      </div>
    </AppShell>
  );
}
