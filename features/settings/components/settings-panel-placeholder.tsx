import { Card } from "@/components/ui/card";

export function SettingsPanelPlaceholder() {
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold">System Settings (Placeholder)</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Milestone 5 will include model selection, system prompt edits, tool toggles, and response style settings.
      </p>
    </Card>
  );
}
