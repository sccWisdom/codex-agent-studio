"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChatMessageItem } from "@/features/chat/types/chat";

type ChatPanelProps = {
  sessionId: string;
  initialMessages: ChatMessageItem[];
};

type SendPayload = {
  userMessage?: ChatMessageItem;
  assistantMessage?: ChatMessageItem;
  error?: string;
};

function formatMessageTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleTimeString();
}

export function ChatPanel({ sessionId, initialMessages }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) {
      return;
    }

    const content = input.trim();
    if (!content) {
      setError("Please enter a message.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const payload = (await response.json()) as SendPayload;

      if (!response.ok) {
        if (payload.userMessage) {
          setMessages((prev) => {
            if (prev.some((item) => item.id === payload.userMessage?.id)) {
              return prev;
            }
            return [...prev, payload.userMessage as ChatMessageItem];
          });
        }

        throw new Error(payload.error ?? "Failed to send message.");
      }

      if (!payload.userMessage || !payload.assistantMessage) {
        throw new Error("Invalid response payload from server.");
      }

      setMessages((prev) => [...prev, payload.userMessage!, payload.assistantMessage!]);
      setInput("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown message send error.");
      router.refresh();
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="flex min-h-[520px] flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Conversation</h2>
        <span className="text-xs text-zinc-500">Session ID: {sessionId}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-600">No messages yet. Start by sending your first question.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto w-[90%] rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
                  : "mr-auto w-[90%] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              }
            >
              <p>{message.content}</p>
              <p
                className={
                  message.role === "user" ? "mt-1 text-right text-xs text-zinc-300" : "mt-1 text-right text-xs text-zinc-500"
                }
              >
                {message.role} · {formatMessageTime(message.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 space-y-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          placeholder="Type your message..."
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
          disabled={isSending}
        />
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>
          ) : (
            <span className="text-xs text-zinc-500">Model response will be saved into this session.</span>
          )}
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
