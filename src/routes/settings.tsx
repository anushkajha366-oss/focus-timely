import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/timely/Shell";
import { useSettings, type Settings } from "@/lib/timely-store";
import { Sparkle, Sun, Moon, Heart, Coffee, Book } from "@/components/timely/Decor";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Timely" },
      { name: "description", content: "Customize your cozy study durations, sounds, and theme." },
      { property: "og:title", content: "Settings — Timely" },
      { property: "og:description", content: "Customize your cozy study durations, sounds, and theme." },
    ],
  }),
  component: SettingsPage,
});

function Group({ title, icon: Icon, children }: { title: string; icon: typeof Heart; children: React.ReactNode }) {
  return (
    <div className="card-soft p-6 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center h-8 w-8 rounded-xl bg-secondary text-primary">
          <Icon size={16} />
        </span>
        <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

function Row({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="py-5 flex items-start justify-between gap-6">
      <div className="max-w-md">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({
  value, onChange, min = 1, max = 180,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center bg-secondary/50 rounded-full border border-border">
      <button
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-card transition-colors"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="decrease"
      >−</button>
      <input
        type="number"
        value={value} min={min} max={max}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="w-12 text-center bg-transparent py-1.5 outline-none tabular text-sm font-medium"
      />
      <button
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-card transition-colors"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="increase"
      >+</button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "relative h-7 w-12 rounded-full transition-colors " +
        (checked ? "bg-primary" : "bg-secondary border border-border")
      }
    >
      <span
        className={
          "absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-transform " +
          (checked ? "translate-x-[22px]" : "translate-x-0.5")
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
      <section className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        <header className="mb-8 text-center md:text-left">
          <p className="font-script text-2xl text-rose">make it yours ♡</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-1">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tweak your durations and vibes. Everything saves automatically.
          </p>
        </header>

        <Group title="Timer" icon={Book}>
          <Row label="Work duration" description="Length of one focus session, in minutes.">
            <NumberInput value={settings.workMinutes} onChange={(v) => set("workMinutes", v)} />
          </Row>
          <Row label="Short break" description="A little breather between sessions.">
            <NumberInput value={settings.breakMinutes} onChange={(v) => set("breakMinutes", v)} />
          </Row>
          <Row label="Long break" description="A longer cozy rest after a full cycle.">
            <NumberInput value={settings.longBreakMinutes} onChange={(v) => set("longBreakMinutes", v)} />
          </Row>
          <Row label="Sessions before long break">
            <NumberInput
              value={settings.sessionsBeforeLongBreak} min={2} max={10}
              onChange={(v) => set("sessionsBeforeLongBreak", v)}
            />
          </Row>
        </Group>

        <Group title="Alerts" icon={Sparkle}>
          <Row label="Notification sound" description="A soft little chime when a session ends.">
            <Toggle checked={settings.soundEnabled} onChange={(v) => set("soundEnabled", v)} />
          </Row>
          <Row label="Browser notifications" description="Get a sweet nudge even in another tab.">
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => requestNotifications(v)}
            />
          </Row>
        </Group>

        <Group title="Appearance" icon={Heart}>
          <Row label="Theme" description="Blush light by day, dusty rose by night.">
            <div className="flex p-1 bg-secondary/60 rounded-full border border-border gap-1">
              {([
                { v: "light", icon: Sun, label: "Light" },
                { v: "dark",  icon: Moon, label: "Dark"  },
              ] as const).map(({ v, icon: Icon, label }) => {
                const active = settings.theme === v;
                return (
                  <button
                    key={v}
                    onClick={() => set("theme", v)}
                    className={
                      "inline-flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full transition-all " +
                      (active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    <Icon size={14} /> {label}
                  </button>
                );
              })}
            </div>
          </Row>
        </Group>

        <Group title="Data" icon={Coffee}>
          <Row label="Reset all data" description="Clear all sessions and restore defaults. This can't be undone.">
            <button
              onClick={() => {
                if (confirm("Clear all sessions and reset settings?")) {
                  localStorage.removeItem("timely.sessions");
                  localStorage.removeItem("timely.settings");
                  window.dispatchEvent(new Event("timely:sessions-updated"));
                  location.reload();
                }
              }}
              className="px-5 py-2 text-sm rounded-full bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              Reset
            </button>
          </Row>
        </Group>
      </section>
    </Shell>
  );
}
