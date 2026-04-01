import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { CreateSessionButton } from "@/features/chat/components/create-session-button";
import type { SessionListItem } from "@/features/chat/types/chat";

type SessionListProps = {
  sessions: SessionListItem[];
  activeSessionId?: string;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleString();
}

export function SessionList({ sessions, activeSessionId }: SessionListProps) {
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold">Sessions</h2>
      <p className="mt-1 text-xs text-zinc-500">Create or switch conversations here.</p>
      <div className="mt-3">
        <CreateSessionButton />
      </div>

      {sessions.length === 0 ? (
        <p className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          No session yet. Create one to start chatting.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <li key={session.id}>
                <Link
                  href={`/chat/${session.id}`}
                  className={cn(
                    "block rounded-md border px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100",
                  )}
                >
                  <p className="line-clamp-1 font-medium">{session.title}</p>
                  <p className={cn("mt-1 text-xs", isActive ? "text-zinc-300" : "text-zinc-500")}>
                    {formatDate(session.updatedAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
