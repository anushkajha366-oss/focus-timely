import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { Timer } from "@/components/timely/Timer";
import { StudyScene, Heart, Star, Sparkle, Flower } from "@/components/timely/Decor";
import {
  computeStreak,
  formatDuration,
  todaysWorkSeconds,
  useSessions,
  useSettings,
} from "@/lib/timely-store";

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
  if (h < 5) return "Late night study, lovely?";
  if (h < 12) return "Good morning, sunshine";
  if (h < 17) return "Hello, study bestie";
  if (h < 21) return "Cozy evening study?";
  return "Tucked in for a study session?";
}

function Home() {
  const sessions = useSessions();
  const { settings } = useSettings();
  const today = todaysWorkSeconds(sessions);
  const streak = computeStreak(sessions);
  const todaysSessions = sessions.filter(
    (s) => s.mode === "work" && new Date(s.startedAt).toDateString() === new Date().toDateString()
  ).length;

  const goalSec = settings.workMinutes * 60 * 4; // gentle daily goal: 4 sessions
  const pct = Math.min(100, Math.round((today / goalSec) * 100));

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-6 pt-2 pb-8">
        <div className="text-center">
          <p className="font-script text-2xl text-rose">{greet()} ♡</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1 tracking-tight">
            Let&rsquo;s have a cozy study session
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="hidden md:flex justify-center">
            <StudyScene className="w-56 animate-bob text-primary" />
          </div>
          <Timer />
          <div className="hidden md:flex justify-center">
            <div className="card-soft p-6 max-w-[240px] text-center">
              <Sparkle className="text-rose mx-auto" size={18} />
              <p className="font-script text-2xl text-rose mt-1">today&rsquo;s vibe</p>
              <p className="text-sm text-muted-foreground mt-2">
                Pop in your earbuds, light a candle, and let&rsquo;s make this session count.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Today */}
          <div className="card-soft p-6 relative overflow-hidden">
            <Flower className="absolute -top-2 -right-2 text-petal/70" size={48} />
            <div className="flex items-center justify-between">
              <span className="chip"><Star size={12} className="text-primary" /> Today</span>
              <span className="font-script text-xl text-rose">{todaysSessions} ✿</span>
            </div>
            <div className="mt-4 font-display text-5xl tabular">
              {today > 0 ? formatDuration(today) : "0m"}
            </div>
            <div className="mt-4">
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-petal to-rose transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {pct >= 100
                  ? "Daily goal met — you legend! ♡"
                  : `${pct}% toward today&rsquo;s cozy goal`}
              </p>
            </div>
          </div>

          {/* Streak */}
          <div className="card-soft p-6 relative overflow-hidden bg-gradient-to-br from-card to-secondary/40">
            <Heart className="absolute -bottom-3 -right-2 text-rose/30 animate-heart" size={64} />
            <span className="chip"><Heart size={12} className="text-rose" /> Streak</span>
            <div className="mt-4 font-display text-5xl tabular">
              {streak}
              <span className="text-xl text-muted-foreground font-sans ml-2">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {streak === 0
                ? "Start your streak with one tiny session ♡"
                : streak < 3
                ? "You&rsquo;re building something lovely."
                : "Look at you go, consistency queen!"}
            </p>
          </div>

          {/* Sessions */}
          <div className="card-soft p-6 relative overflow-hidden">
            <Sparkle className="absolute top-4 right-4 text-rose/70 animate-twinkle" size={18} />
            <Sparkle className="absolute top-10 right-10 text-petal animate-twinkle" size={12} />
            <span className="chip"><Sparkle size={12} className="text-rose" /> Sessions today</span>
            <div className="mt-4 font-display text-5xl tabular">
              {todaysSessions.toString().padStart(2, "0")}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {todaysSessions === 0
                ? "An empty page is a fresh start ✦"
                : "One session at a time — you&rsquo;re glowing."}
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
