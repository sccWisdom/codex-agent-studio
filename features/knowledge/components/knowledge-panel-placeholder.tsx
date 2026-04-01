import { Card } from "@/components/ui/card";

export function KnowledgePanelPlaceholder() {
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold">Knowledge Sources (Placeholder)</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Milestone 4 will support txt and md upload, source list management, delete actions, and retrieval preview.
      </p>
    </Card>
  );
}
