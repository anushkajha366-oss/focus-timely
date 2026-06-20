import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { Heatmap } from "@/components/timely/Heatmap";
import {
  formatDuration,
  startOfDay,
  useSessions,
  type SessionLog,
} from "@/lib/timely-store";
import { useMemo } from "react";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — Timely" },
      { name: "description", content: "Daily, weekly, and monthly study analytics." },
      { property: "og:title", content: "Statistics — Timely" },
      { property: "og:description", content: "Daily, weekly, and monthly study analytics." },
    ],
  }),
  component: Stats,
});

function sumWork(sessions: SessionLog[], from: number): number {
  return sessions
    .filter((s) => s.mode === "work" && s.startedAt >= from)
    .reduce((a, s) => a + s.durationSec, 0);
}

function countWork(sessions: SessionLog[], from: number): number {
  return sessions.filter((s) => s.mode === "work" && s.startedAt >= from).length;
}

function dailyBuckets(sessions: SessionLog[], days: number) {
  const buckets: { label: string; seconds: number; date: Date }[] = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const seconds = sessions
      .filter(
        (s) =>
          s.mode === "work" && s.startedAt >= d.getTime() && s.startedAt < next.getTime()
      )
      .reduce((a, s) => a + s.durationSec, 0);
    buckets.push({
      label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
      date: d,
      seconds,
    });
  }
  return buckets;
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-6 flex flex-col gap-2 bg-card/40">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <span className="font-display text-4xl tabular">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function Stats() {
  const sessions = useSessions();

  const now = new Date();
  const today = startOfDay(now).getTime();
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 86400000)).getTime();
  const monthStart = startOfDay(new Date(now.getTime() - 29 * 86400000)).getTime();

  const trend = useMemo(() => dailyBuckets(sessions, 30), [sessions]);
  const maxSec = Math.max(1, ...trend.map((b) => b.seconds));

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="font-display text-5xl md:text-6xl">Statistics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A clear view of your focus over time.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            label="Today"
            value={formatDuration(sumWork(sessions, today))}
            sub={`${countWork(sessions, today)} sessions`}
          />
          <Card
            label="This week"
            value={formatDuration(sumWork(sessions, weekStart))}
            sub={`${countWork(sessions, weekStart)} sessions`}
          />
          <Card
            label="This month"
            value={formatDuration(sumWork(sessions, monthStart))}
            sub={`${countWork(sessions, monthStart)} sessions`}
          />
        </div>

        <div className="mt-12 rounded-xl border border-border/60 p-6 bg-card/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl">Trend</h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Last 30 days
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {trend.map((b, i) => {
              const h = (b.seconds / maxSec) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-foreground/80 group-hover:bg-foreground rounded-sm transition-colors"
                      style={{ height: `${Math.max(b.seconds > 0 ? 2 : 0, h)}%` }}
                      title={`${b.date.toLocaleDateString()} · ${formatDuration(b.seconds)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{trend[0]?.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <span>Today</span>
          </div>
        </div>

        <div className="mt-12">
          <Heatmap />
        </div>



        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="All time" value={formatDuration(sumWork(sessions, 0))} />
          <Card label="Total sessions" value={countWork(sessions, 0).toString()} />
          <Card
            label="Best day"
            value={formatDuration(Math.max(0, ...trend.map((b) => b.seconds)))}
          />
          <Card
            label="Avg / day"
            value={formatDuration(
              Math.round(trend.reduce((a, b) => a + b.seconds, 0) / Math.max(1, trend.filter(b=>b.seconds>0).length || 1))
            )}
          />
        </div>
      </section>
    </Shell>
  );
}
