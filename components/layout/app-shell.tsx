import type { ReactNode } from "react";
import { MainNav } from "@/components/layout/main-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-semibold">Codex Agent Studio</p>
            <p className="text-xs text-zinc-500">Milestone 1 / Project bootstrap</p>
          </div>
          <MainNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
