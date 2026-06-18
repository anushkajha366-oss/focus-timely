import { useEffect, useState, useCallback } from "react";

export type Settings = {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: "dark" | "light";
};

export const defaultSettings: Settings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  notificationsEnabled: false,
  theme: "dark",
};

export type SessionLog = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  mode: "work" | "break" | "longBreak";
};

const SETTINGS_KEY = "timely.settings";
const SESSIONS_KEY = "timely.sessions";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } as T : fallback;
  } catch {
    return fallback;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(read(SETTINGS_KEY, defaultSettings));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle("light", settings.theme === "light");
  }, [settings, hydrated]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  return { settings, update, hydrated };
}

export function loadSessions(): SessionLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: SessionLog) {
  const all = loadSessions();
  all.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("timely:sessions-updated"));
}

export function useSessions() {
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  useEffect(() => {
    const sync = () => setSessions(loadSessions());
    sync();
    window.addEventListener("timely:sessions-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("timely:sessions-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return sessions;
}

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function computeStreak(sessions: SessionLog[]): number {
  const workDays = new Set(
    sessions
      .filter((s) => s.mode === "work")
      .map((s) => startOfDay(new Date(s.startedAt)).getTime())
  );
  let streak = 0;
  const cursor = startOfDay(new Date());
  // If no session today, streak can still count from yesterday
  if (!workDays.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (workDays.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function todaysWorkSeconds(sessions: SessionLog[]): number {
  const today = startOfDay(new Date()).getTime();
  return sessions
    .filter((s) => s.mode === "work" && startOfDay(new Date(s.startedAt)).getTime() === today)
    .reduce((a, s) => a + s.durationSec, 0);
}
