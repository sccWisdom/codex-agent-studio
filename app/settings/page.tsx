import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsPanel } from "@/features/settings/components/settings-panel";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Settings"
          description="Configure model, system prompt, and tool switches for future requests."
        />
        <SettingsPanel />
      </div>
    </AppShell>
  );
}
