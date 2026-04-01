"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CreateSessionButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
      });

      const payload = (await response.json()) as {
        session?: { id: string };
        error?: string;
      };

      if (!response.ok || !payload.session) {
        throw new Error(payload.error ?? "Failed to create session.");
      }

      router.push(`/chat/${payload.session.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while creating session.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleCreate} disabled={isCreating} className="w-full">
        {isCreating ? "Creating..." : "New Session"}
      </Button>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
