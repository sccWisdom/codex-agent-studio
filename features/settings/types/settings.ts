export type AgentSettingsItem = {
  model: string;
  systemPrompt: string;
  toolEnabled: Record<string, boolean>;
};

export type ToolConfigItem = {
  name: string;
  description: string;
  enabled: boolean;
};

export type SettingsResponse = {
  settings?: AgentSettingsItem;
  tools?: ToolConfigItem[];
  error?: string;
};
