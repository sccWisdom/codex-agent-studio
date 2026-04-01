import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ChatWorkspacePlaceholder() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px,1fr,300px]">
      <Card className="p-4">
        <h2 className="text-sm font-semibold">Session List</h2>
        <p className="mt-2 text-sm text-zinc-600">Milestone 2 will connect session creation, switching, and persistence.</p>
      </Card>
      <Card className="p-4">
        <h2 className="text-sm font-semibold">Message Panel</h2>
        <p className="mt-2 text-sm text-zinc-600">Milestone 2 will connect multi-turn chat and streaming responses.</p>
        <div className="mt-4 flex gap-2">
          <Button disabled>Send</Button>
          <Button variant="outline" disabled>
            Retry Last
          </Button>
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="text-sm font-semibold">Tool Calls</h2>
        <p className="mt-2 text-sm text-zinc-600">Milestone 3 will show tool call records and execution states.</p>
        <Link href="/runs" className="mt-4 inline-block text-sm text-zinc-700 underline">
          View runs page scaffold
        </Link>
      </Card>
    </div>
  );
}
