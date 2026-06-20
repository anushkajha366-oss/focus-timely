import { useMemo, useState } from "react";
import {
  formatDuration,
  startOfDay,
  useSessions,
  type SessionLog,
} from "@/lib/timely-store";
import { Heart, Sparkle } from "./Decor";

type Day = { date: Date; seconds: number; sessions: number };

function buildDays(sessions: SessionLog[]): Day[] {
  const days: Day[] = [];
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

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
    days.push({ date: new Date(cursor), seconds: v?.seconds ?? 0, sessions: v?.sessions ?? 0 });
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
  0: "bg-heat-0 border-petal/30",
  1: "bg-heat-1 border-petal/40",
  2: "bg-heat-2 border-rose/40",
  3: "bg-heat-3 border-rose/60",
};

export function Heatmap() {
  const sessions = useSessions();
  const days = useMemo(() => buildDays(sessions), [sessions]);
  const [selected, setSelected] = useState<Day | null>(null);

  const weeks: Day[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

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
    <div className="card-soft p-7 relative overflow-hidden">
      <Sparkle className="absolute top-5 right-5 text-rose/60 animate-twinkle" size={16} />
      <Heart className="absolute -bottom-3 -left-3 text-petal/40" size={56} />

      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-3xl tracking-tight">Focus garden</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeDays === 0
              ? "Plant your first bloom — a single session counts ♡"
              : <>
                  <span className="text-foreground font-medium">{formatDuration(totalSec)}</span>{" "}
                  across <span className="text-foreground font-medium">{activeDays}</span>{" "}
                  {activeDays === 1 ? "day" : "days"} of cozy focus
                </>}
          </p>
        </div>
        <span className="chip">last 365 days ✿</span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="inline-flex flex-col gap-1.5 min-w-full">
          <div className="flex gap-[3px] pl-6 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80">
            {monthLabels.map((m, i) => (
              <div key={i} className="w-[13px] shrink-0">
                {m ? <span className="inline-block whitespace-nowrap font-medium">{m}</span> : null}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] pr-1.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70 w-5">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} className="h-[13px] leading-[13px]">{d}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week[di];
                  if (!day) return <div key={di} className="w-[13px] h-[13px]" />;
                  const lvl = level(day.seconds);
                  const isSelected = selected && selected.date.getTime() === day.date.getTime();
                  const isFuture = day.date.getTime() > Date.now();
                  return (
                    <button
                      key={di}
                      onClick={() => !isFuture && setSelected(day)}
                      disabled={isFuture}
                      title={`${day.date.toLocaleDateString()} · ${formatDuration(day.seconds)}`}
                      className={
                        "w-[13px] h-[13px] rounded-[4px] border transition-all duration-200 " +
                        "hover:scale-[1.6] hover:z-10 hover:shadow-[var(--shadow-soft)] " +
                        (isFuture ? "opacity-0 pointer-events-none " : "") +
                        LEVEL_STYLE[lvl] +
                        (isSelected ? " ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.4]" : "")
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3].map((l) => (
            <div key={l} className={"w-[13px] h-[13px] rounded-[4px] border " + LEVEL_STYLE[l as 0]} />
          ))}
          <span>More</span>
        </div>

        <div className="min-h-[44px] text-right">
          {selected ? (
            <div className="flex flex-col items-end gap-0.5 animate-[fade-in_0.3s_ease-out]">
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <Sparkle size={11} className="text-rose" />
                {selected.date.toLocaleDateString(undefined, {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                })}
              </span>
              <span className="font-display text-2xl tabular">
                {formatDuration(selected.seconds)}
                <span className="text-muted-foreground text-sm font-sans ml-2">
                  · {selected.sessions} {selected.sessions === 1 ? "session" : "sessions"}
                </span>
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground font-script text-base">
              tap a bloom to peek at that day ✿
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
