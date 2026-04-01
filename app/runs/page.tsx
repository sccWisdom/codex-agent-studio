import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { RunsPanel } from "@/features/runs/components/runs-panel";
import type { RunDetailItem, RunListItem, RunStatus } from "@/features/runs/types/runs";
import { getRunDetail, isRunStatus, listRuns } from "@/lib/runs/run-service";

type RunsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type RunStatusFilter = RunStatus | "all";

function asString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function toRunListItem(input: {
  id: string;
  status: "running" | "success" | "failed";
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  sessionId: string;
  sessionTitle: string;
  userMessagePreview: string | null;
  toolCallCount: number;
}): RunListItem {
  return {
    ...input,
  };
}

function toRunDetailItem(input: {
  id: string;
  status: "running" | "success" | "failed";
  startedAt: Date;
  endedAt: Date | null;
  errorMessage: string | null;
  sessionId: string;
  sessionTitle: string;
  userMessage: {
    id: string;
    content: string;
    createdAt: Date;
  } | null;
  toolCalls: {
    id: string;
    toolName: string;
    inputSummary: string;
    outputSummary: string | null;
    status: "running" | "success" | "failed";
    startedAt: Date;
    endedAt: Date | null;
  }[];
}): RunDetailItem {
  return {
    ...input,
  };
}

export default async function RunsPage({ searchParams }: RunsPageProps) {
  const params = await searchParams;

  const rawStatus = asString(params.status);
  const rawRunId = asString(params.runId);

  const statusFilter = rawStatus && isRunStatus(rawStatus) ? rawStatus : undefined;
  const selectedStatus: RunStatusFilter = statusFilter ?? "all";

  let runs: RunListItem[] = [];
  let selectedRun: RunDetailItem | null = null;
  let selectedRunId: string | null = rawRunId ?? null;
  let loadError: string | null = null;
  let detailError: string | null = null;

  try {
    const listed = await listRuns({
      status: statusFilter,
    });
    runs = listed.map(toRunListItem);

    if (!selectedRunId && runs.length > 0) {
      selectedRunId = runs[0].id;
    }

    if (selectedRunId) {
      const detail = await getRunDetail(selectedRunId);
      if (!detail) {
        detailError = "Selected run does not exist or was removed.";
      } else {
        selectedRun = toRunDetailItem(detail);
      }
    }
  } catch (error) {
    loadError = error instanceof Error ? `Failed to load runs: ${error.message}` : "Failed to load runs.";
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Runs"
          description="Inspect historical runs, tool call chains, and failure details for troubleshooting."
        />
        <RunsPanel
          runs={runs}
          selectedRun={selectedRun}
          selectedRunId={selectedRunId}
          selectedStatus={selectedStatus}
          loadError={loadError}
          detailError={detailError}
        />
      </div>
    </AppShell>
  );
}
