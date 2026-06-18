import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatTime,
  saveSession,
  useSettings,
  type Settings,
} from "@/lib/timely-store";

type Mode = "work" | "break" | "longBreak";

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
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 1.3);
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

export function Timer() {
  const { settings } = useSettings();
  const [mode, setMode] = useState<Mode>("work");
  const [remaining, setRemaining] = useState(settings.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [completedWork, setCompletedWork] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  // Reset timer when mode or relevant settings change while not running
  useEffect(() => {
    if (!running) setRemaining(durationFor(mode, settings));
  }, [mode, settings, running]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining > 0) return;
    if (!running) return;
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
      mode === "work" ? "Focus session complete" : "Break finished",
      mode === "work" ? "Time to take a break." : "Back to work."
    );

    if (mode === "work") {
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
      setRunning(true);
      if (settings.notificationsEnabled && typeof Notification !== "undefined" && Notification.permission === "default") {
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

  const size = 360;
  const stroke = 1.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {(["work", "break", "longBreak"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setRunning(false);
              startedAtRef.current = null;
            }}
            className={
              "px-3 py-1.5 rounded-full transition-colors " +
              (mode === m ? "text-foreground bg-secondary" : "hover:text-foreground")
            }
          >
            {m === "longBreak" ? "Long Break" : m}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-foreground)"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display tabular text-7xl md:text-8xl">
            {formatTime(Math.max(0, remaining))}
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {mode === "work" ? "Focus" : mode === "break" ? "Short break" : "Long break"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={start}
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-opacity min-w-[140px]"
        >
          {running ? "Pause" : remaining < total ? "Resume" : "Start"}
        </button>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
