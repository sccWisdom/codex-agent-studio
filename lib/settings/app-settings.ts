import { db } from "@/lib/db/client";
import { getRegisteredTools } from "@/lib/tools/registered-tools";

const AGENT_MODEL_KEY = "agent.model";
const AGENT_SYSTEM_PROMPT_KEY = "agent.systemPrompt";
const TOOL_ENABLED_KEY_PREFIX = "tool.enabled.";

const FALLBACK_AGENT_MODEL = "gpt-4o-mini";
const FALLBACK_AGENT_SYSTEM_PROMPT =
  "You are Studio Assistant Agent. Use tools only when needed, prioritize knowledge_search for uploaded-document questions, and never fabricate tool results.";

export const DEFAULT_AGENT_MODEL = sanitizeSettingText(process.env.OPENAI_MODEL, FALLBACK_AGENT_MODEL);
export const DEFAULT_AGENT_SYSTEM_PROMPT = sanitizeSettingText(
  process.env.OPENAI_SYSTEM_PROMPT,
  FALLBACK_AGENT_SYSTEM_PROMPT,
);

export type AgentSettings = {
  model: string;
  systemPrompt: string;
  toolEnabled: Record<string, boolean>;
};

export type AgentSettingsPatch = {
  model?: string;
  systemPrompt?: string;
  toolEnabled?: Record<string, boolean>;
};

export class AppSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppSettingsValidationError";
  }
}

export function sanitizeSettingText(value: string | null | undefined, fallback: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

export function coerceBooleanSetting(value: string | null | undefined, fallback: boolean): boolean {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return fallback;
}

export function mergeToolEnabledState(
  availableToolNames: string[],
  base: Record<string, boolean>,
  patch?: Record<string, boolean>,
): Record<string, boolean> {
  const nextState: Record<string, boolean> = {};
  const availableSet = new Set(availableToolNames);

  for (const toolName of availableToolNames) {
    nextState[toolName] = base[toolName] ?? true;
  }

  if (!patch) {
    return nextState;
  }

  for (const [toolName, enabled] of Object.entries(patch)) {
    if (!availableSet.has(toolName)) {
      throw new AppSettingsValidationError(`Unsupported tool key: ${toolName}`);
    }

    if (typeof enabled !== "boolean") {
      throw new AppSettingsValidationError(`Tool enabled state must be boolean: ${toolName}`);
    }

    nextState[toolName] = enabled;
  }

  return nextState;
}

export function getAvailableToolNames(): string[] {
  return getRegisteredTools().map((tool) => tool.name);
}

function toolEnabledKey(toolName: string): string {
  return `${TOOL_ENABLED_KEY_PREFIX}${toolName}`;
}

function requireNonEmptyText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new AppSettingsValidationError(`${label} cannot be empty.`);
  }
  return normalized;
}

function toSettingsMap(rows: { key: string; value: string }[]): Map<string, string> {
  return new Map(rows.map((row) => [row.key, row.value]));
}

export async function getAgentSettings(): Promise<AgentSettings> {
  const availableToolNames = getAvailableToolNames();
  const keys = [
    AGENT_MODEL_KEY,
    AGENT_SYSTEM_PROMPT_KEY,
    ...availableToolNames.map((toolName) => toolEnabledKey(toolName)),
  ];

  const rows = await db.appSetting.findMany({
    where: {
      key: {
        in: keys,
      },
    },
    select: {
      key: true,
      value: true,
    },
  });

  const settingsMap = toSettingsMap(rows);
  const toolEnabled: Record<string, boolean> = {};

  for (const toolName of availableToolNames) {
    toolEnabled[toolName] = coerceBooleanSetting(settingsMap.get(toolEnabledKey(toolName)), true);
  }

  return {
    model: sanitizeSettingText(settingsMap.get(AGENT_MODEL_KEY), DEFAULT_AGENT_MODEL),
    systemPrompt: sanitizeSettingText(
      settingsMap.get(AGENT_SYSTEM_PROMPT_KEY),
      DEFAULT_AGENT_SYSTEM_PROMPT,
    ),
    toolEnabled,
  };
}

async function saveAgentSettings(nextSettings: AgentSettings): Promise<void> {
  const writes = [
    db.appSetting.upsert({
      where: { key: AGENT_MODEL_KEY },
      update: { value: nextSettings.model },
      create: { key: AGENT_MODEL_KEY, value: nextSettings.model },
    }),
    db.appSetting.upsert({
      where: { key: AGENT_SYSTEM_PROMPT_KEY },
      update: { value: nextSettings.systemPrompt },
      create: { key: AGENT_SYSTEM_PROMPT_KEY, value: nextSettings.systemPrompt },
    }),
  ];

  for (const toolName of Object.keys(nextSettings.toolEnabled)) {
    writes.push(
      db.appSetting.upsert({
        where: { key: toolEnabledKey(toolName) },
        update: { value: nextSettings.toolEnabled[toolName] ? "true" : "false" },
        create: {
          key: toolEnabledKey(toolName),
          value: nextSettings.toolEnabled[toolName] ? "true" : "false",
        },
      }),
    );
  }

  await db.$transaction(writes);
}

export async function updateAgentSettings(patch: AgentSettingsPatch): Promise<AgentSettings> {
  const availableToolNames = getAvailableToolNames();
  const current = await getAgentSettings();

  const nextSettings: AgentSettings = {
    model:
      patch.model === undefined
        ? current.model
        : requireNonEmptyText(patch.model, "Model"),
    systemPrompt:
      patch.systemPrompt === undefined
        ? current.systemPrompt
        : requireNonEmptyText(patch.systemPrompt, "System prompt"),
    toolEnabled: mergeToolEnabledState(availableToolNames, current.toolEnabled, patch.toolEnabled),
  };

  await saveAgentSettings(nextSettings);
  return getAgentSettings();
}

export function serializeToolCatalog(enabledMap: Record<string, boolean>) {
  return getRegisteredTools().map((tool) => ({
    name: tool.name,
    description: tool.description,
    enabled: enabledMap[tool.name] ?? true,
  }));
}
