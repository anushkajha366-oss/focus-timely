import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { Timer } from "@/components/timely/Timer";
import {
  computeStreak,
  formatDuration,
  todaysWorkSeconds,
  useSessions,
} from "@/lib/timely-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Timely — Focus Timer" },
      { name: "description", content: "A minimalist Pomodoro timer for deep, distraction-free study." },
      { property: "og:title", content: "Timely — Focus Timer" },
      { property: "og:description", content: "A minimalist Pomodoro timer for deep, distraction-free study." },
    ],
  }),
  component: Home,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <span className="font-display text-3xl tabular">{value}</span>
    </div>
  );
}

function Home() {
  const sessions = useSessions();
  const today = todaysWorkSeconds(sessions);
  const streak = computeStreak(sessions);
  const todaysSessions = sessions.filter(
    (s) => s.mode === "work" && new Date(s.startedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Timer />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-3 gap-10 border-t border-border/60 pt-10">
          <Stat label="Today" value={today > 0 ? formatDuration(today) : "0m"} />
          <Stat label="Sessions" value={todaysSessions.toString().padStart(2, "0")} />
          <Stat label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
        </div>
      </section>
    </Shell>
  );
}
