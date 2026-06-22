import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bow, Heart, Sparkle, FloatingDecor, Sun, Star } from "./Decor";
import studyDesk from "@/assets/study-desk.png";
import {
  computeStreak,
  formatDuration,
  todaysWorkSeconds,
  useSessions,
  useSettings,
} from "@/lib/timely-store";

const nav = [
  { to: "/", label: "Home", icon: Sun },
  { to: "/stats", label: "Statistics", icon: Star },
  { to: "/settings", label: "Settings", icon: Sparkle },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessions = useSessions();
  const { settings } = useSettings();
  const today = todaysWorkSeconds(sessions);
  const streak = computeStreak(sessions);
  const goalSec = settings.workMinutes * 60 * 4;
  const pct = Math.min(100, Math.round((today / goalSec) * 100));

  return (
    <div className="relative min-h-screen">
      <FloatingDecor />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-6 py-5 md:py-7 grid gap-5 md:gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="md:sticky md:top-7 md:self-start flex flex-col gap-5">
          <div className="text-center pt-4">
            <Link to="/" className="inline-flex items-end justify-center gap-1.5">
              <span className="font-brand text-5xl text-rose leading-none">Timely</span>
              <Bow size={26} className="text-rose -mb-1 -ml-1" />
            </Link>
            <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1.5">
              your study companion <Heart size={11} className="text-rose" />
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {nav.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all " +
                    (active
                      ? "bg-gradient-to-r from-petal/70 to-rose/30 text-foreground shadow-[var(--shadow-card)] border border-rose/30"
                      : "text-muted-foreground hover:bg-card/70 hover:text-foreground border border-transparent")
                  }
                >
                  <span className={"grid place-items-center h-7 w-7 rounded-xl " +
                    (active ? "bg-card text-rose" : "bg-secondary/70 text-rose/70")}>
                    <Icon size={14} />
                  </span>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Decorative illustration */}
          <div className="px-2">
            <img
              src={studyDesk}
              alt="Tulips, books, mug and bear study scene"
              width={640}
              height={640}
              loading="lazy"
              className="w-full max-w-[240px] mx-auto animate-bob"
            />
          </div>

          {/* Daily goal */}
          <div className="card-soft p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-rose font-medium">Daily Goal</p>
                <p className="font-display text-3xl mt-1 tabular">
                  {formatDuration(today)}
                  <span className="text-muted-foreground text-base"> / {formatDuration(goalSec)}</span>
                </p>
              </div>
              <Bow size={20} className="text-rose mt-1" />
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-petal to-rose transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">{pct}%</p>
          </div>

          {/* Motivational footer */}
          <div className="card-blush p-4 text-center">
            <p className="text-xs font-script text-rose flex items-center justify-center gap-1.5">
              <Sparkle size={12} /> You got this! <Heart size={11} className="text-rose" />
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {streak > 0
                ? `Day ${streak} of your streak`
                : "Consistency is your superpower."}
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
