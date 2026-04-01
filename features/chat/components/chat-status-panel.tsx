import { Card } from "@/components/ui/card";
import type { RunItem } from "@/features/chat/types/chat";

type ChatStatusPanelProps = {
  status: "idle" | "ready";
  runs: RunItem[];
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

function statusColor(status: "running" | "success" | "failed"): string {
  if (status === "success") {
    return "text-emerald-700";
  }
  if (status === "failed") {
    return "text-red-700";
  }
  return "text-amber-700";
}

export function ChatStatusPanel({ status, runs }: ChatStatusPanelProps) {
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold">Tool Trace</h2>
      <p className="mt-2 text-xs text-zinc-600">
        {status === "ready"
          ? "Latest run records and tool calls for this session."
          : "Create or select a session to see run details."}
      </p>

      {runs.length === 0 ? (
        <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          No run records yet.
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {runs.map((run) => (
            <div key={run.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-700">Run {run.id.slice(0, 8)}</span>
                <span className={`text-xs font-semibold ${statusColor(run.status)}`}>{run.status}</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-600">Start: {formatDateTime(run.startedAt)}</p>
              <p className="text-[11px] text-zinc-600">End: {formatDateTime(run.endedAt)}</p>
              {run.errorMessage ? (
                <p className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700">
                  Error: {run.errorMessage}
                </p>
              ) : null}

              {run.toolCalls.length === 0 ? (
                <p className="mt-2 text-[11px] text-zinc-500">No tools called in this run.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {run.toolCalls.map((toolCall) => (
                    <div key={toolCall.id} className="rounded border border-zinc-200 bg-white px-2 py-2 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-zinc-800">{toolCall.toolName}</span>
                        <span className={`font-semibold ${statusColor(toolCall.status)}`}>
                          {toolCall.status}
                        </span>
                      </div>
                      <p className="mt-1 text-zinc-600">Input: {toolCall.inputSummary || "-"}</p>
                      <p className="text-zinc-600">Output: {toolCall.outputSummary || "-"}</p>
                      <p className="text-zinc-500">Started: {formatDateTime(toolCall.startedAt)}</p>
                      <p className="text-zinc-500">Ended: {formatDateTime(toolCall.endedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
