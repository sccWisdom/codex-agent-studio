import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { milestonePlan } from "@/lib/config/milestones";
import { mainNavItems } from "@/lib/config/navigation";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Codex Agent Studio"
          description="Milestone 1 baseline is ready: project scaffold, route structure, and database model setup."
          actions={
            <Link href="/chat">
              <Button>Open Chat</Button>
            </Link>
          }
        />

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-sm font-semibold">Current Stage</h2>
            <p className="mt-2 text-sm text-zinc-600">Milestone 1: Project bootstrap</p>
            <ul className="mt-3 space-y-2 text-sm">
              {milestonePlan.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                  <span>{item.id}. {item.title}</span>
                  <span className={item.status === "current" ? "text-emerald-700" : "text-zinc-500"}>
                    {item.status === "current" ? "In progress" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Navigation</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {mainNavItems.map((item) => (
                <li key={item.href} className="rounded-md border border-zinc-200 px-3 py-2">
                  <Link href={item.href} className="font-medium text-zinc-900 underline">
                    {item.label}
                  </Link>
                  <p className="mt-1 text-zinc-600">{item.description}</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
