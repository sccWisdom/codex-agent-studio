"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SettingsResponse, ToolConfigItem } from "@/features/settings/types/settings";

type Notice = {
  type: "success" | "error";
  text: string;
};

function normalizeTools(tools: ToolConfigItem[]): ToolConfigItem[] {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

export function SettingsPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [model, setModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState<ToolConfigItem[]>([]);

  const hasToolRows = useMemo(() => tools.length > 0, [tools]);

  async function loadSettings() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/settings", {
        method: "GET",
      });

      const payload = (await response.json()) as SettingsResponse;
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load settings.");
      }

      if (!payload.settings || !payload.tools) {
        throw new Error("Invalid settings payload from server.");
      }

      setModel(payload.settings.model);
      setSystemPrompt(payload.settings.systemPrompt);
      setTools(normalizeTools(payload.tools));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unknown settings load error.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const normalizedModel = model.trim();
    const normalizedPrompt = systemPrompt.trim();

    if (!normalizedModel) {
      setNotice({ type: "error", text: "Model cannot be empty." });
      return;
    }

    if (!normalizedPrompt) {
      setNotice({ type: "error", text: "System prompt cannot be empty." });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    const toolEnabled = Object.fromEntries(tools.map((tool) => [tool.name, tool.enabled]));

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: normalizedModel,
          systemPrompt: normalizedPrompt,
          toolEnabled,
        }),
      });

      const payload = (await response.json()) as SettingsResponse;
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save settings.");
      }

      if (!payload.settings || !payload.tools) {
        throw new Error("Invalid settings payload from server.");
      }

      setModel(payload.settings.model);
      setSystemPrompt(payload.settings.systemPrompt);
      setTools(normalizeTools(payload.tools));
      setNotice({ type: "success", text: "Settings saved. New chat requests will use the updated values." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown settings save error.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function toggleTool(toolName: string) {
    setTools((prev) => prev.map((tool) => (tool.name === toolName ? { ...tool, enabled: !tool.enabled } : tool)));
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-zinc-600">Loading settings...</p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="space-y-3 p-4">
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
        <Button variant="outline" onClick={loadSettings}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <form className="space-y-5" onSubmit={handleSave}>
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Model</h2>
          <input
            type="text"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
            placeholder="gpt-4o-mini"
            disabled={isSaving}
          />
          <p className="text-xs text-zinc-500">Applied to all new chat requests after save.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">System Prompt</h2>
          <textarea
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            rows={6}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
            placeholder="Describe how the assistant should behave"
            disabled={isSaving}
          />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Tool Switches</h2>
          {!hasToolRows ? (
            <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              No tools are registered.
            </p>
          ) : (
            <div className="space-y-2">
              {tools.map((tool) => (
                <label
                  key={tool.name}
                  className="flex items-start justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{tool.name}</p>
                    <p className="text-xs text-zinc-600">{tool.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={() => toggleTool(tool.name)}
                    disabled={isSaving}
                    className="mt-1 h-4 w-4 accent-zinc-900"
                  />
                </label>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between gap-3">
          {notice ? (
            <p
              className={
                notice.type === "success"
                  ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
                  : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              }
            >
              {notice.text}
            </p>
          ) : (
            <span className="text-xs text-zinc-500">Changes are stored in local database settings.</span>
          )}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
