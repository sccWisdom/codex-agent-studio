import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KnowledgePanelPlaceholder } from "@/features/knowledge/components/knowledge-panel-placeholder";

export default function KnowledgePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Knowledge"
          description="Source upload, list management, and retrieval test will be delivered in Milestone 4."
        />
        <KnowledgePanelPlaceholder />
      </div>
    </AppShell>
  );
}
