import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatTime,
  saveSession,
  useSettings,
  type Settings,
} from "@/lib/timely-store";
import { Sparkle, Heart, Coffee, Book, SparkleBurst } from "./Decor";

type Mode = "work" | "break" | "longBreak";

const ENCOURAGE = [
  "You got this! ♡",
  "One session at a time ✿",
  "Focus, sweet brain ⋆",
  "Slow sips, deep work ☕",
  "Tiny steps, big dreams ✦",
  "You're doing amazing ♡",
];

function durationFor(mode: Mode, s: Settings) {
  if (mode === "work") return s.workMinutes * 60;
  if (mode === "break") return s.breakMinutes * 60;
  return s.longBreakMinutes * 60;
}

function chime(enabled: boolean) {
  if (!enabled) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    // Soft two-note chime (C6 → E6)
    [1046.5, 1318.5].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 1.2);
    });
  } catch {
    /* ignore */
  }
}

function notify(enabled: boolean, title: string, body: string) {
  if (!enabled || typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

const MODE_META: Record<Mode, { label: string; icon: typeof Coffee; sub: string }> = {
  work:      { label: "Focus",      icon: Book,   sub: "Time to study ♡" },
  break:     { label: "Short break", icon: Coffee, sub: "Sip something warm" },
  longBreak: { label: "Long break", icon: Heart,  sub: "Stretch, breathe, smile" },
};

export function Timer() {
  const { settings } = useSettings();
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(settings.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [completedWork, setCompletedWork] = useState(0);
  const [burst, setBurst] = useState(false);
  const [encourage, setEncourage] = useState(ENCOURAGE[0]);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) setRemaining(durationFor(mode, settings));
  }, [mode, settings, running]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining > 0 || !running) return;
    setRunning(false);
    const ended = Date.now();
    const dur = durationFor(mode, settings);
    if (startedAtRef.current) {
      saveSession({
        id: crypto.randomUUID(),
        startedAt: startedAtRef.current,
        endedAt: ended,
        durationSec: dur,
        mode,
      });
    }
    startedAtRef.current = null;
    chime(settings.soundEnabled);
    notify(
      settings.notificationsEnabled,
      mode === "work" ? "Focus session complete ♡" : "Break finished ✿",
      mode === "work" ? "Yay! Time for a little break." : "Back to your cozy study."
    );

    if (mode === "work") {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 1400);
      const nextCount = completedWork + 1;
      setCompletedWork(nextCount);
      const next: Mode = nextCount % settings.sessionsBeforeLongBreak === 0 ? "longBreak" : "break";
      setMode(next);
      setRemaining(durationFor(next, settings));
    } else {
      setMode("work");
      setRemaining(durationFor("work", settings));
    }
  }, [remaining, running, mode, settings, completedWork]);

  const total = durationFor(mode, settings);
  const progress = useMemo(() => 1 - remaining / total, [remaining, total]);

  const start = () => {
    if (!running) {
      if (startedAtRef.current === null) startedAtRef.current = Date.now();
      setEncourage(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
      setRunning(true);
      if (
        settings.notificationsEnabled &&
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission();
      }
    } else {
      setRunning(false);
    }
  };

  const reset = () => {
    setRunning(false);
    startedAtRef.current = null;
    setRemaining(durationFor(mode, settings));
  };

  const size = 340;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode pills */}
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-secondary/60 border border-border/70 shadow-[var(--shadow-card)]">
        {(["work", "break", "longBreak"] as Mode[]).map((m) => {
          const Icon = MODE_META[m].icon;
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setRunning(false);
                startedAtRef.current = null;
              }}
              className={
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all " +
                (active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <Icon size={14} className={active ? "text-primary" : ""} />
              {MODE_META[m].label}
            </button>
          );
        })}
      </div>

      {/* Timer dial */}
      <div className="relative" style={{ width: size, height: size }}>
        <SparkleBurst show={burst} />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--petal) 60%, transparent), transparent 70%)",
          }}
        />
        <svg width={size} height={size} className="-rotate-90 relative">
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--rose)" />
              <stop offset="100%" stopColor="var(--petal)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="color-mix(in oklab, var(--petal) 60%, transparent)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ring)"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-rose font-medium inline-flex items-center gap-1.5">
            <Sparkle size={12} /> {MODE_META[mode].label}
          </div>
          <div className="font-display tabular text-7xl md:text-[7.5rem] leading-none mt-2 text-foreground">
            {formatTime(Math.max(0, remaining))}
          </div>
          <div className="mt-3 font-script text-xl text-rose/90">
            {running ? encourage : MODE_META[mode].sub}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={start}
          className="px-9 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.98] transition-transform shadow-[var(--shadow-soft)] min-w-[160px]"
        >
          {running ? "Pause" : remaining < total ? "Resume" : "Start session"}
        </button>
        <button
          onClick={reset}
          className="px-6 py-3.5 rounded-full bg-card border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
