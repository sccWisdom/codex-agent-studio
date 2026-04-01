import { describe, expect, it } from "vitest";
import {
  coerceBooleanSetting,
  mergeToolEnabledState,
  sanitizeSettingText,
} from "@/lib/settings/app-settings";

describe("app settings helpers", () => {
  it("falls back when text setting is empty", () => {
    expect(sanitizeSettingText("   ", "fallback")).toBe("fallback");
    expect(sanitizeSettingText("  value  ", "fallback")).toBe("value");
  });

  it("coerces boolean settings safely", () => {
    expect(coerceBooleanSetting("true", false)).toBe(true);
    expect(coerceBooleanSetting("false", true)).toBe(false);
    expect(coerceBooleanSetting("invalid", true)).toBe(true);
    expect(coerceBooleanSetting(undefined, false)).toBe(false);
  });

  it("merges tool enabled map and keeps unspecified tools", () => {
    const merged = mergeToolEnabledState(
      ["knowledge_search", "extract_structured_items", "mock_data_lookup"],
      {
        knowledge_search: true,
        extract_structured_items: true,
        mock_data_lookup: true,
      },
      {
        extract_structured_items: false,
      },
    );

    expect(merged).toEqual({
      knowledge_search: true,
      extract_structured_items: false,
      mock_data_lookup: true,
    });
  });

  it("throws for unsupported tool keys in patch", () => {
    expect(() =>
      mergeToolEnabledState(["knowledge_search"], { knowledge_search: true }, { unknown_tool: false }),
    ).toThrow("Unsupported tool key");
  });
});
