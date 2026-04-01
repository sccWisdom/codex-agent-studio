import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsPanelPlaceholder } from "@/features/settings/components/settings-panel-placeholder";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Settings"
          description="Model options, system prompt, tool switches, and response style settings will be added in Milestone 5."
        />
        <SettingsPanelPlaceholder />
      </div>
    </AppShell>
  );
}
