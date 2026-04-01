import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeManager } from "@/features/knowledge/components/knowledge-manager";
import type { KnowledgeSourceItem } from "@/features/knowledge/types/knowledge";
import { listKnowledgeSources } from "@/lib/knowledge/knowledge-service";

function serializeSources(
  sources: {
    id: string;
    name: string;
    type: string;
    contentPreview: string;
    createdAt: Date;
  }[],
): KnowledgeSourceItem[] {
  return sources.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    contentPreview: item.contentPreview,
    createdAt: item.createdAt.toISOString(),
  }));
}

export default async function KnowledgePage() {
  const sources = serializeSources(await listKnowledgeSources());

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Knowledge"
          description="Upload txt/md, manage sources, and run retrieval tests."
        />
        <KnowledgeManager initialSources={sources} />
      </div>
    </AppShell>
  );
}
