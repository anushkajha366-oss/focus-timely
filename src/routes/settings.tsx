import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { useSettings, type Settings } from "@/lib/timely-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Timely" },
      { name: "description", content: "Tune your focus and break durations, notifications, and theme." },
      { property: "og:title", content: "Settings — Timely" },
      { property: "og:description", content: "Tune your focus and break durations, notifications, and theme." },
    ],
  }),
  component: SettingsPage,
});

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-6 border-b border-border/60 flex items-start justify-between gap-8">
      <div className="max-w-md">
        <div className="text-sm text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min = 1,
  max = 180,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center border border-border rounded-md">
      <button
        className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="decrease"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="w-14 text-center bg-transparent py-1.5 outline-none tabular text-sm"
      />
      <button
        className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "relative h-6 w-11 rounded-full transition-colors " +
        (checked ? "bg-foreground" : "bg-secondary border border-border")
      }
    >
      <span
        className={
          "absolute top-0.5 h-5 w-5 rounded-full transition-transform " +
          (checked ? "translate-x-[22px] bg-background" : "translate-x-0.5 bg-foreground")
        }
      />
    </button>
  );
}

function SettingsPage() {
  const { settings, update, hydrated } = useSettings();
  if (!hydrated) return <Shell><div className="h-96" /></Shell>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => update({ [k]: v } as Partial<Settings>);

  const requestNotifications = async (enabled: boolean) => {
    if (enabled && typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    set("notificationsEnabled", enabled);
  };

  return (
    <Shell>
      <section className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        <header className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Personalize Timely. Changes save automatically.
          </p>
        </header>

        <div>
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-10 mb-2">
            Timer
          </h2>
          <Row label="Work duration" description="Length of one focus session, in minutes.">
            <NumberInput value={settings.workMinutes} onChange={(v) => set("workMinutes", v)} />
          </Row>
          <Row label="Short break" description="Recovery time between focus sessions.">
            <NumberInput value={settings.breakMinutes} onChange={(v) => set("breakMinutes", v)} />
          </Row>
          <Row label="Long break" description="Extended rest after a full cycle.">
            <NumberInput value={settings.longBreakMinutes} onChange={(v) => set("longBreakMinutes", v)} />
          </Row>
          <Row label="Sessions before long break">
            <NumberInput
              value={settings.sessionsBeforeLongBreak}
              min={2}
              max={10}
              onChange={(v) => set("sessionsBeforeLongBreak", v)}
            />
          </Row>

          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-10 mb-2">
            Alerts
          </h2>
          <Row label="Notification sound" description="A soft chime when a session ends.">
            <Toggle checked={settings.soundEnabled} onChange={(v) => set("soundEnabled", v)} />
          </Row>
          <Row label="Browser notifications" description="Get notified even in another tab.">
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => requestNotifications(v)}
            />
          </Row>

          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-10 mb-2">
            Appearance
          </h2>
          <Row label="Theme" description="Dark by default. Light for daytime sessions.">
            <div className="flex border border-border rounded-md overflow-hidden">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => set("theme", t)}
                  className={
                    "px-4 py-1.5 text-sm capitalize " +
                    (settings.theme === t
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>

          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-10 mb-2">
            Data
          </h2>
          <Row label="Reset all data" description="Clear sessions and restore default settings.">
            <button
              onClick={() => {
                if (confirm("Delete all sessions and reset settings?")) {
                  localStorage.removeItem("timely.sessions");
                  localStorage.removeItem("timely.settings");
                  window.dispatchEvent(new Event("timely:sessions-updated"));
                  location.reload();
                }
              }}
              className="px-4 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              Reset
            </button>
          </Row>
        </div>
      </section>
    </Shell>
  );
}
