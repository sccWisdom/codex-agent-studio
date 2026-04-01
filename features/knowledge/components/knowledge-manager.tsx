"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  KnowledgeSearchResult,
  KnowledgeSourceItem,
} from "@/features/knowledge/types/knowledge";

type KnowledgeManagerProps = {
  initialSources: KnowledgeSourceItem[];
};

type UploadResponse = {
  source?: KnowledgeSourceItem;
  error?: string;
};

type ListResponse = {
  sources?: KnowledgeSourceItem[];
  error?: string;
};

type SearchResponse = {
  summary?: string;
  result?: KnowledgeSearchResult;
  error?: string;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function KnowledgeManager({ initialSources }: KnowledgeManagerProps) {
  const [sources, setSources] = useState(initialSources);
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [searchSummary, setSearchSummary] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<KnowledgeSearchResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reloadSources() {
    const response = await fetch("/api/knowledge", { method: "GET" });
    const payload = (await response.json()) as ListResponse;

    if (!response.ok || !payload.sources) {
      throw new Error(payload.error ?? "Failed to refresh knowledge list.");
    }

    setSources(payload.sources);
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please choose a .txt or .md file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadResponse;
      if (!response.ok) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      await reloadSources();
      setFile(null);
      const input = document.getElementById("knowledge-file") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown upload error.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(sourceId: string) {
    setError(null);

    try {
      const response = await fetch(`/api/knowledge/${sourceId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Delete failed.");
      }

      setSources((prev) => prev.filter((item) => item.id !== sourceId));
      if (searchResult) {
        setSearchResult({
          query: searchResult.query,
          matches: searchResult.matches.filter((item) => item.sourceId !== sourceId),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown delete error.");
    }
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter query text for retrieval test.");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmed, limit: 5 }),
      });

      const payload = (await response.json()) as SearchResponse;
      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Retrieval test failed.");
      }

      setSearchSummary(payload.summary ?? null);
      setSearchResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown search error.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
      <Card className="space-y-4 p-4">
        <div>
          <h2 className="text-sm font-semibold">Upload Knowledge</h2>
          <p className="mt-1 text-xs text-zinc-500">Supported types: .txt, .md</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-3">
          <input
            id="knowledge-file"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
            }}
            className="block w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm"
          />
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </form>

        <div>
          <h3 className="text-sm font-semibold">Knowledge List</h3>
          {sources.length === 0 ? (
            <p className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              No source yet. Upload a file to start retrieval.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {sources.map((source) => (
                <li key={source.id} className="rounded-md border border-zinc-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{source.name}</p>
                      <p className="text-xs text-zinc-500">
                        {source.type} · {formatDateTime(source.createdAt)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void handleDelete(source.id)}>
                      Delete
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600">{source.contentPreview || "(empty preview)"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div>
          <h2 className="text-sm font-semibold">Retrieval Test</h2>
          <p className="mt-1 text-xs text-zinc-500">
            This uses the same knowledge search tool available to the agent.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter query, for example: deployment"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Run Retrieval Test"}
          </Button>
        </form>

        {searchSummary ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {searchSummary}
          </p>
        ) : null}

        {searchResult ? (
          <div>
            <h3 className="text-sm font-semibold">Matches</h3>
            {searchResult.matches.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600">No matches.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {searchResult.matches.map((match) => (
                  <li key={`${match.sourceId}-${match.name}`} className="rounded-md border border-zinc-200 bg-white p-3">
                    <p className="text-sm font-medium text-zinc-900">{match.name}</p>
                    <p className="text-xs text-zinc-500">{match.type}</p>
                    <p className="mt-1 text-xs text-zinc-700">{match.snippet}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Card>

      {error ? (
        <div className="lg:col-span-2">
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        </div>
      ) : null}
    </div>
  );
}
