import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RunDetailItem, RunListItem, RunStatus } from "@/features/runs/types/runs";

type RunStatusFilter = RunStatus | "all";

type RunsPanelProps = {
  runs: RunListItem[];
  selectedRun: RunDetailItem | null;
  selectedRunId: string | null;
  selectedStatus: RunStatusFilter;
  loadError: string | null;
  detailError: string | null;
};

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

function statusTextClass(status: RunStatus): string {
  if (status === "success") {
    return "text-emerald-700";
  }
  if (status === "failed") {
    return "text-red-700";
  }
  return "text-amber-700";
}

function buildRunHref(runId: string, status: RunStatusFilter): string {
  const params = new URLSearchParams();
  params.set("runId", runId);
  if (status !== "all") {
    params.set("status", status);
  }
  return `/runs?${params.toString()}`;
}

export function RunsPanel({
  runs,
  selectedRun,
  selectedRunId,
  selectedStatus,
  loadError,
  detailError,
}: RunsPanelProps) {
  if (loadError) {
    return (
      <Card className="p-4">
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Run History</h2>
          <span className="text-xs text-zinc-500">{runs.length} runs</span>
        </div>

        <form method="GET" className="mb-3 flex items-center gap-2">
          <select
            name="status"
            defaultValue={selectedStatus}
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="running">Running</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <Button type="submit" variant="outline" size="sm">
            Filter
          </Button>
        </form>

        {runs.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            No runs found.
          </p>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <Link
                key={run.id}
                href={buildRunHref(run.id, selectedStatus)}
                className={
                  selectedRunId === run.id
                    ? "block rounded-md border border-zinc-900 bg-zinc-100 px-3 py-2"
                    : "block rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 hover:bg-zinc-100"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-800">Run {run.id.slice(0, 8)}</span>
                  <span className={`text-xs font-semibold ${statusTextClass(run.status)}`}>{run.status}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">Session: {run.sessionTitle}</p>
                <p className="text-xs text-zinc-600">Started: {formatDateTime(run.startedAt)}</p>
                <p className="text-xs text-zinc-600">Tools: {run.toolCallCount}</p>
                {run.userMessagePreview ? (
                  <p className="mt-1 text-xs text-zinc-600">Message: {run.userMessagePreview}</p>
                ) : null}
                {run.errorMessage ? (
                  <p className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                    {run.errorMessage}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold">Run Detail</h2>
        {detailError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {detailError}
          </p>
        ) : null}

        {!selectedRun ? (
          <p className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            Select a run from the left list to inspect details.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
              <p>
                <span className="font-medium">Run:</span> {selectedRun.id}
              </p>
              <p>
                <span className="font-medium">Session:</span> {selectedRun.sessionTitle}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className={`font-semibold ${statusTextClass(selectedRun.status)}`}>{selectedRun.status}</span>
              </p>
              <p>
                <span className="font-medium">Started:</span> {formatDateTime(selectedRun.startedAt)}
              </p>
              <p>
                <span className="font-medium">Ended:</span> {formatDateTime(selectedRun.endedAt)}
              </p>
            </div>

            {selectedRun.errorMessage ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Run error: {selectedRun.errorMessage}
              </p>
            ) : null}

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Prompt Message</h3>
              {selectedRun.userMessage ? (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                  <p>{selectedRun.userMessage.content}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    at {formatDateTime(selectedRun.userMessage.createdAt)}
                  </p>
                </div>
              ) : (
                <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                  No prompt message captured.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Tool Calls</h3>
              {selectedRun.toolCalls.length === 0 ? (
                <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                  No tools were called in this run.
                </p>
              ) : (
                selectedRun.toolCalls.map((toolCall) => (
                  <div key={toolCall.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-800">{toolCall.toolName}</p>
                      <span className={`text-xs font-semibold ${statusTextClass(toolCall.status)}`}>
                        {toolCall.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">Input: {toolCall.inputSummary || "-"}</p>
                    <p className="text-xs text-zinc-600">Output: {toolCall.outputSummary || "-"}</p>
                    <p className="text-xs text-zinc-500">Started: {formatDateTime(toolCall.startedAt)}</p>
                    <p className="text-xs text-zinc-500">Ended: {formatDateTime(toolCall.endedAt)}</p>
                    {toolCall.status === "failed" ? (
                      <p className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                        Tool call failed. See output summary above for detail.
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </Card>
    </div>
  );
}
