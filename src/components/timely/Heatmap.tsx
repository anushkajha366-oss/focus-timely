import { useMemo, useState } from "react";
import {
  formatDuration,
  startOfDay,
  useSessions,
  type SessionLog,
} from "@/lib/timely-store";

type Day = {
  date: Date;
  seconds: number;
  sessions: number;
};

function buildDays(sessions: SessionLog[]): Day[] {
  const days: Day[] = [];
  const today = startOfDay(new Date());
  // Start 364 days ago, but align to Sunday for clean weekly columns
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  const map = new Map<number, { seconds: number; sessions: number }>();
  for (const s of sessions) {
    if (s.mode !== "work") continue;
    const key = startOfDay(new Date(s.startedAt)).getTime();
    const cur = map.get(key) ?? { seconds: 0, sessions: 0 };
    cur.seconds += s.durationSec;
    cur.sessions += 1;
    map.set(key, cur);
  }

  const cursor = new Date(start);
  while (cursor.getTime() <= today.getTime()) {
    const key = cursor.getTime();
    const v = map.get(key);
    days.push({
      date: new Date(cursor),
      seconds: v?.seconds ?? 0,
      sessions: v?.sessions ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function level(seconds: number): 0 | 1 | 2 | 3 {
  const m = seconds / 60;
  if (m <= 0) return 0;
  if (m < 30) return 1;
  if (m < 90) return 2;
  return 3;
}

const LEVEL_STYLE: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-foreground/[0.06] border-foreground/[0.04]",
  1: "bg-foreground/25 border-foreground/10",
  2: "bg-foreground/55 border-foreground/20",
  3: "bg-foreground border-foreground/40",
};

export function Heatmap() {
  const sessions = useSessions();
  const days = useMemo(() => buildDays(sessions), [sessions]);
  const [selected, setSelected] = useState<Day | null>(null);

  // Split into weeks (columns of 7)
  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Month labels: show label on the first week where the month changes
  const monthLabels = weeks.map((w, i) => {
    const first = w[0];
    if (!first) return null;
    const prev = i > 0 ? weeks[i - 1][0] : null;
    if (!prev || first.date.getMonth() !== prev.date.getMonth()) {
      return first.date.toLocaleDateString(undefined, { month: "short" });
    }
    return null;
  });

  const totalSec = days.reduce((a, d) => a + d.seconds, 0);
  const activeDays = days.filter((d) => d.seconds > 0).length;

  return (
    <div className="rounded-xl border border-border/60 p-6 bg-card/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl">Focus heatmap</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDuration(totalSec)} across {activeDays}{" "}
            {activeDays === 1 ? "day" : "days"} in the last year
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          365 days
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5 min-w-full">
          {/* Month labels */}
          <div className="flex gap-[3px] pl-6 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {monthLabels.map((m, i) => (
              <div key={i} className="w-[11px] shrink-0">
                {m ? <span className="inline-block whitespace-nowrap">{m}</span> : null}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[3px] pr-1 text-[9px] uppercase tracking-[0.1em] text-muted-foreground w-5">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} className="h-[11px] leading-[11px]">
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week[di];
                  if (!day) {
                    return <div key={di} className="w-[11px] h-[11px]" />;
                  }
                  const lvl = level(day.seconds);
                  const isSelected =
                    selected && selected.date.getTime() === day.date.getTime();
                  const isFuture = day.date.getTime() > Date.now();
                  return (
                    <button
                      key={di}
                      onClick={() => !isFuture && setSelected(day)}
                      disabled={isFuture}
                      title={`${day.date.toLocaleDateString()} · ${formatDuration(day.seconds)}`}
                      className={
                        "w-[11px] h-[11px] rounded-[2px] border transition-all " +
                        (isFuture ? "opacity-0 pointer-events-none " : "") +
                        LEVEL_STYLE[lvl] +
                        (isSelected ? " ring-1 ring-foreground ring-offset-1 ring-offset-background" : "")
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3].map((l) => (
            <div
              key={l}
              className={"w-[11px] h-[11px] rounded-[2px] border " + LEVEL_STYLE[l as 0]}
            />
          ))}
          <span>More</span>
        </div>

        <div className="min-h-[42px] text-right">
          {selected ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-muted-foreground">
                {selected.date.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-display text-xl tabular">
                {formatDuration(selected.seconds)}
                <span className="text-muted-foreground text-sm font-sans not-italic">
                  {" "}· {selected.sessions}{" "}
                  {selected.sessions === 1 ? "session" : "sessions"}
                </span>
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Select a day to see details
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
