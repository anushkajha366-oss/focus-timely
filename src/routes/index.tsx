import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { Timer } from "@/components/timely/Timer";
import { Heart, Sparkle, Star, Coffee, Flower, SparkleCluster, Bow } from "@/components/timely/Decor";
import {
  computeStreak,
  formatDuration,
  formatTime,
  todaysWorkSeconds,
  useSessions,
  useSettings,
} from "@/lib/timely-store";
import journal from "@/assets/journal.png";
import mascot from "@/assets/mascot-bear.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Timely — Your cozy study companion" },
      { name: "description", content: "A cute, cozy Pomodoro timer for focused study sessions." },
      { property: "og:title", content: "Timely — Your cozy study companion" },
      { property: "og:description", content: "A cute, cozy Pomodoro timer for focused study sessions." },
    ],
  }),
  component: Home,
});

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Late night study";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Tucked in for study";
}

function Home() {
  const sessions = useSessions();
  const { settings } = useSettings();
  const today = todaysWorkSeconds(sessions);
  const streak = computeStreak(sessions);
  const todaysSessions = sessions.filter(
    (s) => s.mode === "work" && new Date(s.startedAt).toDateString() === new Date().toDateString()
  );
  const recent = [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 4);

  return (
    <Shell>
      {/* Greeting */}
      <div className="card-blush p-5 md:p-6 flex items-center gap-4 relative overflow-hidden">
        <img src={mascot} alt="Bear mascot" width={512} height={512}
             loading="lazy" className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 animate-bob" />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl md:text-3xl tracking-tight">
            {greet()}, Cutie! <span className="inline-block text-rose"><Flower size={20} /></span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Let&apos;s make today productive ♡</p>
        </div>
        <img src={journal} alt="Pink journal with heart" width={512} height={512}
             loading="lazy" className="hidden sm:block w-16 h-16 md:w-20 md:h-20 animate-float" />
        <SparkleCluster className="absolute top-3 right-24 hidden md:inline-flex animate-twinkle" />
      </div>

      {/* Timer */}
      <div className="mt-5">
        <Timer />
      </div>

      {/* Today's Overview */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display text-2xl tracking-tight inline-flex items-center gap-2">
            Today&apos;s Overview <Heart size={14} className="text-rose" />
          </h2>
          <span className="text-xs text-muted-foreground font-script text-base">today ♡</span>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <OverviewCard label="Study Time" value={today > 0 ? formatDuration(today) : "0m"}
            icon={<Coffee size={14} />} tint="petal" />
          <OverviewCard label="Sessions" value={todaysSessions.length.toString()}
            icon={<Sparkle size={14} />} tint="blush" />
          <OverviewCard label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`}
            icon={<Star size={14} />} tint="cream" />
        </div>
      </section>

      {/* Recent Sessions */}
      <section className="mt-6 card-soft p-5 md:p-6 relative overflow-hidden">
        <Bow size={36} className="absolute -top-2 -right-2 text-rose/30" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-tight inline-flex items-center gap-2">
            Recent Sessions
          </h2>
          <SparkleCluster />
        </div>
        {recent.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No sessions yet — your first cozy session is one tap away ♡
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((s) => {
              const date = new Date(s.startedAt);
              const mins = Math.round(s.durationSec / 60);
              const label = s.mode === "work" ? "Focus Time" : s.mode === "break" ? "Short Break" : "Long Break";
              const dot = s.mode === "work" ? "bg-rose" : "bg-petal";
              return (
                <li key={s.id} className="py-3 flex items-center gap-3">
                  <span className={"h-2 w-2 rounded-full " + dot} />
                  <span className="text-sm font-medium flex-1">{label}</span>
                  <span className="text-xs text-muted-foreground tabular w-16 text-right">
                    {mins} min
                  </span>
                  <span className="text-xs text-muted-foreground tabular w-20 text-right">
                    {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                  <Heart size={13} className="text-rose/40 hover:text-rose transition-colors" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Mini summary footer */}
      <div className="mt-6 card-blush p-5 md:p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-script text-xl text-rose">Little by little,</p>
          <p className="font-display text-2xl tracking-tight">a little becomes a lot.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-rose font-medium">Total focus today</p>
          <p className="font-display text-3xl tabular">{formatTime(today)}</p>
        </div>
      </div>
    </Shell>
  );
}

function OverviewCard({
  label, value, icon, tint,
}: { label: string; value: string; icon: React.ReactNode; tint: "petal" | "blush" | "cream" }) {
  const bg = tint === "petal" ? "from-petal/40 to-petal/10"
           : tint === "blush" ? "from-rose/20 to-rose/5"
           : "from-cream to-blush/40";
  return (
    <div className={`rounded-2xl border border-petal/40 p-4 md:p-5 bg-gradient-to-br ${bg} relative overflow-hidden`}>
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-rose font-semibold">
        {icon} {label}
      </span>
      <p className="font-display text-2xl md:text-3xl tabular mt-2">{value}</p>
    </div>
  );
}
