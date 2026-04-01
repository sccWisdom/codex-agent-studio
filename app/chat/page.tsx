import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ChatEmptyState } from "@/features/chat/components/chat-empty-state";
import { ChatStatusPanel } from "@/features/chat/components/chat-status-panel";
import { SessionList } from "@/features/chat/components/session-list";
import type { SessionListItem } from "@/features/chat/types/chat";
import { chatStore } from "@/lib/chat/chat-runtime";

function serializeSessions(
  sessions: { id: string; title: string; updatedAt: Date }[],
): SessionListItem[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt.toISOString(),
  }));
}

export default async function ChatPage() {
  const sessions = serializeSessions(await chatStore.listSessions());

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Chat Workspace"
          description="Create sessions, view history, and continue conversations with a single agent."
        />

        <div className="grid gap-4 lg:grid-cols-[280px,1fr,300px]">
          <SessionList sessions={sessions} />
          <ChatEmptyState />
          <ChatStatusPanel status="idle" />
        </div>
      </div>
    </AppShell>
  );
}
