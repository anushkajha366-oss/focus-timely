import { useEffect, useMemo, useRef, useState } from "react";
import {
formatTime,
saveSession,
useSettings,
type Settings,
} from "@/lib/timely-store";
import { Sparkle, Heart, Coffee, Book, Bow, SparkleBurst, Flower } from "./Decor";
import plant from "@/assets/plant.png";
import mugBooks from "@/assets/mug-books.png";

type Mode = "work" | "break" | "longBreak";

const ENCOURAGE = [
"You got this! ♡",
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
} catch { /* ignore */ }
}

function notify(enabled: boolean, title: string, body: string) {
if (!enabled || typeof Notification === "undefined") return;
if (Notification.permission === "granted") new Notification(title, { body });
}

const MODE_META: Record<Mode, { label: string; icon: typeof Coffee; sub: string }> = {
work:      { label: "Focus Time",   icon: Book,   sub: "Time to study ♡" },
break:     { label: "Short Break",  icon: Coffee, sub: "Sip something warm" },
longBreak: { label: "Long Break",   icon: Heart,  sub: "Stretch, breathe, smile" },
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
setRemaining((prev) => {
  const duration = durationFor(mode, settings);
  return prev === 0 || prev > duration ? duration : prev;
});
}, [mode, settings]);

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

const stop = () => {
  setRunning(false);
  startedAtRef.current = null;
  setMode("work");
  setRemaining(durationFor("work", settings));
};

const size = 300;
const stroke = 12;
const r = (size - stroke) / 2;
const c = 2 * Math.PI * r;

return (
  <div className="card-blush p-5 md:p-8 relative overflow-hidden">
    {/* Floating hearts */}
    <Heart size={18} className="absolute top-6 left-6 text-rose/60 animate-heart" />
    <Bow size={22} className="absolute top-8 right-1/2 -mr-1 text-rose/50 hidden md:block" />
    <Sparkle size={16} className="absolute top-10 right-12 text-rose/60 animate-twinkle" />
    <Sparkle size={12} className="absolute bottom-24 right-20 text-petal animate-twinkle" />
    <Flower size={16} className="absolute bottom-10 left-8 text-petal/70" />

    {/* Focus pill */}
    <div className="flex justify-center">
      <span className="chip bg-card text-rose border-rose/30">
        <Flower size={11} /> {MODE_META[mode].label}
      </span>
    </div>

    {/* Side illustrations */}
    <div className="relative mt-4 flex items-center justify-center">
      <img src={plant} alt="Pink heart plant"
           width={512} height={512} loading="lazy"
           className="hidden md:block absolute left-2 bottom-2 w-24 lg:w-28 animate-bob" />
      <img src={mugBooks} alt="Pink mug on books"
           width={512} height={512} loading="lazy"
           className="hidden md:block absolute right-2 bottom-2 w-24 lg:w-28 animate-float" />

      {/* Timer ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <SparkleBurst show={burst} />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--petal) 75%, transparent), transparent 70%)",
          }}
        />
        <Bow size={28} className="absolute left-1/2 -translate-x-1/2 -top-3 text-rose z-10 drop-shadow-sm" />
        <svg width={size} height={size} className="-rotate-90 relative">
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--rose)" />
              <stop offset="100%" stopColor="var(--petal)" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="var(--color-card)"
                  stroke="color-mix(in oklab, var(--petal) 60%, transparent)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                  stroke="url(#ring)" strokeWidth={stroke}
                  strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear" }} />
          {/* tiny dotted inner ring */}
          <circle cx={size / 2} cy={size / 2} r={r - 18} fill="none"
                  stroke="color-mix(in oklab, var(--rose) 30%, transparent)"
                  strokeWidth="1" strokeDasharray="1 6" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Heart size={14} className="text-rose mb-1" />
          <div className="font-display tabular text-6xl md:text-7xl leading-none text-foreground">
            {formatTime(Math.max(0, remaining))}
          </div>
          <span className="mt-3 chip text-rose">
            <Flower size={10} /> {MODE_META[mode].label}
          </span>
        </div>
      </div>
    </div>

    {/* Start button */}
    <div className="mt-7 flex justify-center">
      <button
        onClick={start}
        className="btn-rose btn-rose-hover px-10 py-3.5 text-sm min-w-[200px]"
      >
        {running
          ? <>❚❚ Pause</>
          : remaining < total
            ? <>▸ Resume</>
            : <>▸ Start</>}
      </button>
    </div>

    {/* Secondary controls */}
    <div className="mt-3 flex items-center justify-center gap-3">
      <CtrlBtn onClick={reset} aria-label="Reset">↺</CtrlBtn>
      <CtrlBtn onClick={() => setRunning(false)} aria-label="Pause">❚❚</CtrlBtn>
      <CtrlBtn onClick={stop} aria-label="Stop">■</CtrlBtn>
    </div>

    {/* Mode pills (Focus/Short Break/Long Break) */}
    <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
      {(["work", "break", "longBreak"] as Mode[]).map((m) => {
        const active = mode === m;
        const sub = m === "work" ? `${settings.workMinutes} min`
                  : m === "break" ? `${settings.breakMinutes} min`
                  : `${settings.longBreakMinutes} min`;
        return (
          <button
            key={m}
            onClick={() => { setMode(m); setRunning(false); startedAtRef.current = null; }}
            className={
              "rounded-2xl p-3 text-center border transition-all " +
              (active
                ? "bg-gradient-to-br from-rose/20 to-petal/30 border-rose/40 text-foreground shadow-[var(--shadow-card)]"
                : "bg-card/70 border-border/60 text-muted-foreground hover:text-foreground hover:border-rose/30")
            }
          >
            <div className="text-xs font-medium">{MODE_META[m].label}</div>
            <div className="text-[11px] text-muted-foreground tabular mt-0.5">{sub}</div>
          </button>
        );
      })}
    </div>

    {/* Encouragement */}
    <p className="mt-4 text-center font-script text-lg text-rose/80">
      {running ? encourage : MODE_META[mode].sub}
    </p>
  </div>
);
}

function CtrlBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
return (
  <button
    {...p}
    className="h-11 w-11 rounded-full bg-card border border-border/70 text-muted-foreground hover:text-rose hover:border-rose/40 transition-all hover:scale-105 grid place-items-center text-sm shadow-[var(--shadow-card)]"
  >
    {children}
  </button>
);
}
