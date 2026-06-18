import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Timer" },
  { to: "/stats", label: "Statistics" },
  { to: "/settings", label: "Settings" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-2 w-2 rounded-full bg-foreground" />
            <span className="font-display text-2xl leading-none">Timely</span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "px-3 py-1.5 text-sm rounded-md transition-colors " +
                    (active
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 h-12 flex items-center justify-between text-xs text-muted-foreground">
          <span>Stored locally on this device.</span>
          <span className="font-mono">v1.0</span>
        </div>
      </footer>
    </div>
  );
}
