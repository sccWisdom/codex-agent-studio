import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ChatWorkspacePlaceholder } from "@/features/chat/components/chat-workspace-placeholder";

export default function ChatPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Chat Workspace"
          description="Session creation, message exchange, and agent responses will be connected in Milestone 2."
        />
        <ChatWorkspacePlaceholder />
      </div>
    </AppShell>
  );
}
