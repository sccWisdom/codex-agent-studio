import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ChatWorkspacePlaceholder } from "@/features/chat/components/chat-workspace-placeholder";

type ChatSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title={`Session ${sessionId}`}
          description="This is a placeholder detail page. Session history restore and multi-turn context will be added in Milestone 2."
        />
        <ChatWorkspacePlaceholder />
      </div>
    </AppShell>
  );
}
