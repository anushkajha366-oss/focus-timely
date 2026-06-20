import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bow, Heart, Sparkle, FloatingDecor } from "./Decor";

const nav = [
  { to: "/", label: "Timer" },
  { to: "/stats", label: "Statistics" },
  { to: "/settings", label: "Settings" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="relative min-h-screen flex flex-col">
      <FloatingDecor />

      <header className="relative z-10">
        <div className="mx-auto max-w-5xl px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center h-9 w-9 rounded-2xl bg-secondary text-primary shadow-[var(--shadow-card)] group-hover:rotate-6 transition-transform">
              <Bow size={20} />
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl leading-none tracking-tight">Timely</span>
              <span className="font-script text-rose text-lg leading-none -mb-0.5">♡</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 p-1 rounded-full bg-card/70 border border-border/70 backdrop-blur-sm shadow-[var(--shadow-card)]">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "px-4 py-1.5 text-sm rounded-full transition-all " +
                    (active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 mt-12">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            Made with <Heart size={12} className="text-rose animate-heart" /> for cozy study sessions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkle size={12} className="text-rose" /> saved on your device
          </span>
        </div>
      </footer>
    </div>
  );
}
