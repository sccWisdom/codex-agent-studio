import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { RunsPanelPlaceholder } from "@/features/runs/components/runs-panel-placeholder";

export default function RunsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Runs"
          description="Run list, status filters, tool call details, and failure trace will be completed in Milestone 5."
        />
        <RunsPanelPlaceholder />
      </div>
    </AppShell>
  );
}
