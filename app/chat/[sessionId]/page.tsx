import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { ChatStatusPanel } from "@/features/chat/components/chat-status-panel";
import { SessionList } from "@/features/chat/components/session-list";
import type {
  ChatMessageItem,
  RunItem,
  SessionListItem,
  ToolCallItem,
} from "@/features/chat/types/chat";
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

function serializeToolCalls(
  toolCalls: {
    id: string;
    runId: string;
    toolName: string;
    inputSummary: string;
    outputSummary: string | null;
    status: "running" | "success" | "failed";
    startedAt: Date;
    endedAt: Date | null;
  }[],
): ToolCallItem[] {
  return toolCalls.map((item) => ({
    id: item.id,
    runId: item.runId,
    toolName: item.toolName,
    inputSummary: item.inputSummary,
    outputSummary: item.outputSummary,
    status: item.status,
    startedAt: item.startedAt.toISOString(),
    endedAt: item.endedAt ? item.endedAt.toISOString() : null,
  }));
}

function serializeRuns(
  runs: {
    id: string;
    sessionId: string;
    userMessageId: string | null;
    status: "running" | "success" | "failed";
    startedAt: Date;
    endedAt: Date | null;
    errorMessage: string | null;
    toolCalls: {
      id: string;
      runId: string;
      toolName: string;
      inputSummary: string;
      outputSummary: string | null;
      status: "running" | "success" | "failed";
      startedAt: Date;
      endedAt: Date | null;
    }[];
  }[],
): RunItem[] {
  return runs.map((run) => ({
    id: run.id,
    sessionId: run.sessionId,
    userMessageId: run.userMessageId,
    status: run.status,
    startedAt: run.startedAt.toISOString(),
    endedAt: run.endedAt ? run.endedAt.toISOString() : null,
    errorMessage: run.errorMessage,
    toolCalls: serializeToolCalls(run.toolCalls),
  }));
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;

  const [sessions, session, runs] = await Promise.all([
    chatStore.listSessions(),
    chatStore.getSessionWithMessages(sessionId),
    chatStore.listRunsBySession(sessionId, 10),
  ]);

  const serializedRuns = serializeRuns(runs);

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
              initialRuns={serializedRuns}
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

          <ChatStatusPanel status={session ? "ready" : "idle"} runs={serializedRuns} />
        </div>
      </div>
    </AppShell>
  );
}
