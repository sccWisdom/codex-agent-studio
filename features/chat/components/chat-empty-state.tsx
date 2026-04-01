import { Card } from "@/components/ui/card";

export function ChatEmptyState() {
  return (
    <Card className="flex min-h-[520px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-lg font-semibold text-zinc-900">No active session</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Use the left panel to create a session. After creation, select it to start multi-turn chat.
        </p>
      </div>
    </Card>
  );
}
