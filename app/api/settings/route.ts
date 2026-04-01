import { NextResponse } from "next/server";
import {
  AppSettingsValidationError,
  type AgentSettingsPatch,
  getAgentSettings,
  serializeToolCatalog,
  updateAgentSettings,
} from "@/lib/settings/app-settings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parsePatch(input: unknown): AgentSettingsPatch {
  if (!isRecord(input)) {
    throw new AppSettingsValidationError("Invalid request body.");
  }

  const patch: AgentSettingsPatch = {};

  if (Object.prototype.hasOwnProperty.call(input, "model")) {
    if (typeof input.model !== "string") {
      throw new AppSettingsValidationError("model must be a string.");
    }
    patch.model = input.model;
  }

  if (Object.prototype.hasOwnProperty.call(input, "systemPrompt")) {
    if (typeof input.systemPrompt !== "string") {
      throw new AppSettingsValidationError("systemPrompt must be a string.");
    }
    patch.systemPrompt = input.systemPrompt;
  }

  if (Object.prototype.hasOwnProperty.call(input, "toolEnabled")) {
    if (!isRecord(input.toolEnabled)) {
      throw new AppSettingsValidationError("toolEnabled must be an object.");
    }

    const toolEnabled: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(input.toolEnabled)) {
      if (typeof value !== "boolean") {
        throw new AppSettingsValidationError(`toolEnabled.${key} must be boolean.`);
      }
      toolEnabled[key] = value;
    }

    patch.toolEnabled = toolEnabled;
  }

  return patch;
}

export async function GET() {
  try {
    const settings = await getAgentSettings();
    return NextResponse.json({
      settings,
      tools: serializeToolCatalog(settings.toolEnabled),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to load settings: ${detail}`,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  try {
    const patch = parsePatch(body);
    if (Object.keys(patch).length === 0) {
      throw new AppSettingsValidationError("At least one setting field is required.");
    }

    const settings = await updateAgentSettings(patch);
    return NextResponse.json({
      settings,
      tools: serializeToolCatalog(settings.toolEnabled),
    });
  } catch (error) {
    if (error instanceof AppSettingsValidationError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    const detail = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to update settings: ${detail}`,
      },
      { status: 500 },
    );
  }
}
