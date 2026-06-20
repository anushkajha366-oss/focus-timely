import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { Heatmap } from "@/components/timely/Heatmap";
import { Sparkle, Star, Heart, Flower, Book, Coffee } from "@/components/timely/Decor";
import {
  formatDuration,
  startOfDay,
  useSessions,
  useSettings,
  type SessionLog,
} from "@/lib/timely-store";
import { useMemo } from "react";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — Timely" },
      { name: "description", content: "Cute, cozy study analytics — daily, weekly, monthly." },
      { property: "og:title", content: "Statistics — Timely" },
      { property: "og:description", content: "Cute, cozy study analytics — daily, weekly, monthly." },
    ],
  }),
  component: Stats,
});

function sumWork(sessions: SessionLog[], from: number) {
  return sessions
    .filter((s) => s.mode === "work" && s.startedAt >= from)
    .reduce((a, s) => a + s.durationSec, 0);
}
function countWork(sessions: SessionLog[], from: number) {
  return sessions.filter((s) => s.mode === "work" && s.startedAt >= from).length;
}
function dailyBuckets(sessions: SessionLog[], days: number) {
  const buckets: { label: string; seconds: number; date: Date }[] = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const seconds = sessions
      .filter((s) => s.mode === "work" && s.startedAt >= d.getTime() && s.startedAt < next.getTime())
      .reduce((a, s) => a + s.durationSec, 0);
    buckets.push({
      label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
      date: d, seconds,
    });
  }
  return buckets;
}

function StatCard({
  label, value, sub, icon: Icon, tint = "petal",
}: {
  label: string; value: string; sub?: string;
  icon: typeof Heart; tint?: "petal" | "rose";
}) {
  return (
    <div className="card-soft p-6 relative overflow-hidden group">
      <div
        className={
          "absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-60 group-hover:scale-110 transition-transform " +
          (tint === "rose" ? "bg-rose/20" : "bg-petal/40")
        }
      />
      <div className="relative flex items-center justify-between">
        <span className="chip"><Icon size={12} className="text-primary" /> {label}</span>
      </div>
      <div className="relative mt-4 font-display text-4xl tabular">{value}</div>
      {sub && <div className="relative text-xs text-muted-foreground mt-1.5">{sub}</div>}
    </div>
  );
}

function Stats() {
  const sessions = useSessions();
  const { settings } = useSettings();

  const now = new Date();
  const today = startOfDay(now).getTime();
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 86400000)).getTime();
  const monthStart = startOfDay(new Date(now.getTime() - 29 * 86400000)).getTime();

  const trend = useMemo(() => dailyBuckets(sessions, 30), [sessions]);
  const maxSec = Math.max(1, ...trend.map((b) => b.seconds));

  const dailyGoalSec = settings.workMinutes * 60 * 4;
  const weeklyGoalSec = dailyGoalSec * 5;
  const todaySec = sumWork(sessions, today);
  const weekSec = sumWork(sessions, weekStart);
  const dailyPct = Math.min(100, Math.round((todaySec / dailyGoalSec) * 100));
  const weeklyPct = Math.min(100, Math.round((weekSec / weeklyGoalSec) * 100));

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <header className="mb-10 text-center md:text-left">
          <p className="font-script text-2xl text-rose">your cozy stats ♡</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">
            Look how far you&apos;ve come
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg md:mx-0 mx-auto">
            Every bloom in your garden is a session you showed up for. So proud of you.
          </p>
        </header>

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            label="Today" icon={Star}
            value={formatDuration(sumWork(sessions, today))}
            sub={`${countWork(sessions, today)} sweet sessions`}
          />
          <StatCard
            label="This week" icon={Heart} tint="rose"
            value={formatDuration(sumWork(sessions, weekStart))}
            sub={`${countWork(sessions, weekStart)} sessions in 7 days`}
          />
          <StatCard
            label="This month" icon={Flower}
            value={formatDuration(sumWork(sessions, monthStart))}
            sub={`${countWork(sessions, monthStart)} sessions in 30 days`}
          />
        </div>

        {/* Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div className="card-soft p-6 relative overflow-hidden">
            <Coffee className="absolute -bottom-3 -right-3 text-petal/60" size={64} />
            <div className="flex items-center justify-between">
              <span className="chip"><Sparkle size={12} className="text-rose" /> Daily goal</span>
              <span className="font-script text-rose text-xl">{dailyPct}%</span>
            </div>
            <div className="mt-4">
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-petal to-rose transition-all duration-700"
                  style={{ width: `${dailyPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDuration(todaySec)} of {formatDuration(dailyGoalSec)} today
              </p>
            </div>
          </div>

          <div className="card-soft p-6 relative overflow-hidden">
            <Book className="absolute -bottom-3 -right-3 text-rose/30" size={64} />
            <div className="flex items-center justify-between">
              <span className="chip"><Heart size={12} className="text-rose" /> Weekly goal</span>
              <span className="font-script text-rose text-xl">{weeklyPct}%</span>
            </div>
            <div className="mt-4">
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose to-primary transition-all duration-700"
                  style={{ width: `${weeklyPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDuration(weekSec)} of {formatDuration(weeklyGoalSec)} this week
              </p>
            </div>
          </div>
        </div>

        {/* Trend chart */}
        <div className="mt-8 card-soft p-7 relative overflow-hidden">
          <Sparkle className="absolute top-5 right-5 text-rose/60 animate-twinkle" size={16} />
          <div className="flex items-end justify-between mb-8 flex-wrap gap-2">
            <div>
              <h2 className="font-display text-3xl tracking-tight">Last 30 days</h2>
              <p className="text-sm text-muted-foreground mt-1">a soft little rhythm of focus</p>
            </div>
            <span className="chip">trend ✿</span>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {trend.map((b, i) => {
              const h = (b.seconds / maxSec) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t-full bg-gradient-to-t from-petal to-rose group-hover:from-rose group-hover:to-primary transition-all duration-300"
                      style={{ height: `${Math.max(b.seconds > 0 ? 4 : 0, h)}%` }}
                      title={`${b.date.toLocaleDateString()} · ${formatDuration(b.seconds)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{trend[0]?.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <span>today ♡</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="mt-8">
          <Heatmap />
        </div>

        {/* Bottom summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard label="All time"    icon={Star}   value={formatDuration(sumWork(sessions, 0))} />
          <StatCard label="Total sessions" icon={Heart} tint="rose"
                    value={countWork(sessions, 0).toString()} />
          <StatCard label="Best day"    icon={Flower}
                    value={formatDuration(Math.max(0, ...trend.map((b) => b.seconds)))} />
          <StatCard label="Avg / day"   icon={Coffee} tint="rose"
                    value={formatDuration(
                      Math.round(trend.reduce((a, b) => a + b.seconds, 0) /
                        Math.max(1, trend.filter((b) => b.seconds > 0).length || 1))
                    )} />
        </div>
      </section>
    </Shell>
  );
}
