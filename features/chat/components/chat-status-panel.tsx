import { Card } from "@/components/ui/card";

type ChatStatusPanelProps = {
  status: "idle" | "ready";
};

export function ChatStatusPanel({ status }: ChatStatusPanelProps) {
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold">Run Status</h2>
      <p className="mt-2 text-sm text-zinc-600">
        {status === "ready"
          ? "This session is ready. Send a message in the center panel."
          : "Create or select a session to begin."}
      </p>
      <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
        Tool trace panel will be expanded in Milestone 3.
      </div>
    </Card>
  );
}
