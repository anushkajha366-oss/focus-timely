import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { Heatmap } from "@/components/timely/Heatmap";
import { Sparkle, Star, Heart, Flower, Book, Coffee, Calendar, Bow, SparkleCluster } from "@/components/timely/Decor";
import {
  formatDuration,
  startOfDay,
  useSessions,
  type SessionLog,
} from "@/lib/timely-store";
import { useMemo, useState } from "react";
import mascot from "@/assets/mascot-bear.png";
import studyDesk from "@/assets/study-desk.png";

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

type Range = "daily" | "weekly" | "monthly" | "yearly";

function rangeStart(r: Range): number {
  const now = new Date();
  const d = startOfDay(now);
  if (r === "daily") return d.getTime();
  if (r === "weekly") { d.setDate(d.getDate() - 6); return d.getTime(); }
  if (r === "monthly") { d.setDate(d.getDate() - 29); return d.getTime(); }
  d.setDate(d.getDate() - 364); return d.getTime();
}
function rangeDays(r: Range) {
  return r === "daily" ? 1 : r === "weekly" ? 7 : r === "monthly" ? 30 : 365;
}

function sumWork(sessions: SessionLog[], from: number) {
  return sessions.filter((s) => s.mode === "work" && s.startedAt >= from).reduce((a, s) => a + s.durationSec, 0);
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

function Stats() {
  const sessions = useSessions();
  const [range, setRange] = useState<Range>("monthly");
  const [hover, setHover] = useState<{ d: Date; sec: number } | null>(null);

  const from = rangeStart(range);
  const totalSec = sumWork(sessions, from);
  const sessionsCount = countWork(sessions, from);
  const days = rangeDays(range);
  const avg = Math.round(totalSec / Math.max(1, days));

  const trend = useMemo(() => dailyBuckets(sessions, 30), [sessions]);
  const maxSec = Math.max(1, ...trend.map((b) => b.seconds));

  // Streak
  const workDays = new Set(
    sessions.filter((s) => s.mode === "work").map((s) => startOfDay(new Date(s.startedAt)).getTime())
  );
  let cur = 0;
  const cursor = startOfDay(new Date());
  if (!workDays.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
  while (workDays.has(cursor.getTime())) { cur += 1; cursor.setDate(cursor.getDate() - 1); }
  // Longest
  const sortedDays = [...workDays].sort((a, b) => a - b);
  let longest = 0, run = 0, prev = 0;
  for (const t of sortedDays) {
    if (prev && t - prev === 86400000) run += 1; else run = 1;
    longest = Math.max(longest, run); prev = t;
  }

  const monthLabel = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <Shell>
      <div className="card-blush p-5 md:p-6 flex items-center gap-4 relative overflow-hidden">
        <div className="flex-1">
          <h1 className="font-display text-2xl md:text-3xl tracking-tight inline-flex items-center gap-2">
            Statistics <Heart size={18} className="text-rose" />
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Look how far you&apos;ve come ♡</p>
        </div>
        <button className="h-11 w-11 rounded-2xl bg-card border border-border grid place-items-center text-rose">
          <Calendar size={18} />
        </button>
      </div>

      {/* Range tabs */}
      <div className="mt-5 grid grid-cols-4 gap-2 p-1.5 rounded-full card-soft">
        {(["daily", "weekly", "monthly", "yearly"] as Range[]).map((r) => {
          const active = range === r;
          return (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                "py-2 text-sm font-medium rounded-full transition-all capitalize " +
                (active
                  ? "bg-gradient-to-r from-rose to-rose/80 text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {r}
            </button>
          );
        })}
      </div>

      {/* Top stats */}
      <section className="mt-5 card-soft p-5 md:p-6">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl tracking-tight inline-flex items-center gap-2">
            {range === "yearly" ? "This Year" : monthLabel}
            <Sparkle size={14} className="text-rose" />
          </h2>
          <span className="chip"><Calendar size={11} /> This {range.replace("ly", "")}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatBox label="Total Time" value={formatDuration(totalSec) || "0m"}
                   icon={<Coffee size={13} />} tint="petal" />
          <StatBox label="Sessions" value={sessionsCount.toString()}
                   icon={<Book size={13} />} tint="rose" />
          <StatBox label="Daily Avg" value={formatDuration(avg) || "0m"}
                   icon={<Heart size={13} />} tint="blush" />
        </div>
      </section>

      {/* Heatmap */}
      <section className="mt-5">
        <Heatmap />
      </section>

      {/* Streaks */}
      <section className="mt-5 card-soft p-5 md:p-6 grid grid-cols-2 gap-4 md:gap-6 relative overflow-hidden">
        <img src={mascot} alt="Bear mascot"
             width={512} height={512} loading="lazy"
             className="hidden md:block absolute -left-2 bottom-0 w-24 animate-bob" />
        <div className="md:pl-24">
          <p className="text-xs uppercase tracking-[0.18em] text-rose font-semibold flex items-center gap-1.5">
            <Heart size={11} /> Current Streak
          </p>
          <p className="font-display text-4xl md:text-5xl tabular mt-2">
            {cur} <span className="text-xl text-muted-foreground font-sans">days</span>
          </p>
        </div>
        <div className="border-l border-border/60 pl-4 md:pl-6">
          <p className="text-xs uppercase tracking-[0.18em] text-rose font-semibold flex items-center gap-1.5">
            <Star size={11} /> Longest Streak
          </p>
          <p className="font-display text-4xl md:text-5xl tabular mt-2">
            {longest} <span className="text-xl text-muted-foreground font-sans">days</span>
          </p>
        </div>
        <Bow size={28} className="absolute top-4 right-4 text-rose/50" />
      </section>

      {/* 30-day trend */}
      <section className="mt-5 card-soft p-5 md:p-6 relative overflow-hidden">
        <div className="flex items-end justify-between mb-2 flex-wrap gap-2">
          <h2 className="font-display text-2xl tracking-tight">30-Day Trend</h2>
          <span className="chip">Study Time</span>
        </div>
        <p className="text-xs text-muted-foreground mb-5 font-script text-base">
          a soft little rhythm of focus ✿
        </p>

        <div className="relative h-56">
          <svg viewBox={`0 0 ${trend.length * 20} 100`} preserveAspectRatio="none"
               className="w-full h-full">
            <defs>
              <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--rose)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--rose)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* gridlines */}
            {[0, 25, 50, 75].map((y) => (
              <line key={y} x1="0" y1={y} x2={trend.length * 20} y2={y}
                    stroke="color-mix(in oklab, var(--petal) 40%, transparent)"
                    strokeWidth="0.4" strokeDasharray="1 3" />
            ))}
            {/* area */}
            <path
              d={`M 0 100 ${trend.map((b, i) => `L ${i * 20 + 10} ${100 - (b.seconds / maxSec) * 90}`).join(" ")} L ${(trend.length - 1) * 20 + 10} 100 Z`}
              fill="url(#line-grad)"
            />
            {/* line */}
            <path
              d={trend.map((b, i) => `${i === 0 ? "M" : "L"} ${i * 20 + 10} ${100 - (b.seconds / maxSec) * 90}`).join(" ")}
              fill="none" stroke="var(--rose)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"
            />
            {/* points */}
            {trend.map((b, i) => (
              <circle key={i} cx={i * 20 + 10} cy={100 - (b.seconds / maxSec) * 90} r="1.6"
                      fill="var(--color-card)" stroke="var(--rose)" strokeWidth="1"
                      onMouseEnter={() => setHover({ d: b.date, sec: b.seconds })}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: "pointer" }} />
            ))}
          </svg>
          {hover && (
            <div className="absolute top-2 right-2 bg-rose text-primary-foreground rounded-xl px-3 py-1.5 text-xs shadow-[var(--shadow-soft)]">
              <div className="font-display text-base tabular">{formatDuration(hover.sec) || "0m"}</div>
              <div className="opacity-90 text-[10px]">
                {hover.d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>{trend[0]?.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          <span>{trend[Math.floor(trend.length / 2)]?.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          <span>today ♡</span>
        </div>
      </section>

      {/* Motivational footer */}
      <section className="mt-5 card-blush p-5 md:p-7 flex items-center gap-4 md:gap-6 relative overflow-hidden">
        <img src={studyDesk} alt="Cozy study scene"
             width={640} height={640} loading="lazy"
             className="w-24 md:w-32 flex-shrink-0 animate-bob" />
        <div className="flex-1">
          <p className="font-script text-2xl text-rose">Little by little,</p>
          <p className="font-display text-2xl md:text-3xl tracking-tight">a little becomes a lot.</p>
          <SparkleCluster className="mt-2" />
        </div>
      </section>

      {/* All time summary */}
      <section className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatBox label="All Time" value={formatDuration(sumWork(sessions, 0)) || "0m"}
                 icon={<Star size={12} />} tint="petal" />
        <StatBox label="Total Sessions" value={countWork(sessions, 0).toString()}
                 icon={<Heart size={12} />} tint="rose" />
        <StatBox label="Best Day" value={formatDuration(Math.max(0, ...trend.map((b) => b.seconds))) || "0m"}
                 icon={<Flower size={12} />} tint="blush" />
        <StatBox label="Avg / Day" value={formatDuration(
          Math.round(trend.reduce((a, b) => a + b.seconds, 0) /
            Math.max(1, trend.filter((b) => b.seconds > 0).length || 1))
        ) || "0m"} icon={<Coffee size={12} />} tint="petal" />
      </section>
    </Shell>
  );
}

function StatBox({
  label, value, icon, tint,
}: { label: string; value: string; icon: React.ReactNode; tint: "petal" | "rose" | "blush" }) {
  const bg = tint === "petal" ? "from-petal/40 to-petal/10"
           : tint === "rose"  ? "from-rose/20 to-rose/5"
           : "from-blush to-blush/40";
  return (
    <div className={`rounded-2xl border border-petal/40 p-4 bg-gradient-to-br ${bg}`}>
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-rose font-semibold">
        {icon} {label}
      </span>
      <p className="font-display text-2xl md:text-3xl tabular mt-2">{value}</p>
    </div>
  );
}
