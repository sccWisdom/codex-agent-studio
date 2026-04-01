import { Card } from "@/components/ui/card";

export function RunsPanelPlaceholder() {
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold">Run History (Placeholder)</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Milestone 5 will add run list, status filters, tool call detail, and error tracking.
      </p>
    </Card>
  );
}
