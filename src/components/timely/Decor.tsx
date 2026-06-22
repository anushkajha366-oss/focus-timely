import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function Bow({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 12c-3-3-7-3.5-7-.5S8 15 12 12s7 .5 7-2.5-4-2.5-7 .5Z" fill="currentColor" opacity=".9" />
      <circle cx="12" cy="12" r="1.7" fill="var(--color-background)" />
      <path d="M11 14c-.6 2.2-1 3.6-1.4 4.6M13 14c.6 2.2 1 3.6 1.4 4.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Heart({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" fill="currentColor" />
    </svg>
  );
}

export function Star({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z" fill="currentColor" />
    </svg>
  );
}

export function Sparkle({ size = 14, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 2c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7Z" fill="currentColor" />
    </svg>
  );
}

export function Flower({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <g fill="currentColor">
        <circle cx="12" cy="6"  r="3" opacity=".9" />
        <circle cx="6"  cy="12" r="3" opacity=".9" />
        <circle cx="18" cy="12" r="3" opacity=".9" />
        <circle cx="12" cy="18" r="3" opacity=".9" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="var(--color-background)" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function Tulip({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 4c2 2 4 4 4 7a4 4 0 0 1-8 0c0-3 2-5 4-7Z" fill="currentColor" />
      <path d="M12 11v9" stroke="#5fa86b" strokeWidth="1.6" />
      <path d="M12 16c-2-1-4 0-4 3M12 18c2-1 4 0 4 2" stroke="#5fa86b" strokeWidth="1.6" />
    </svg>
  );
}

export function Cloud({ size = 26, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M7 17h11a3.5 3.5 0 0 0 .4-6.97A5 5 0 0 0 8.6 9.2 4 4 0 0 0 7 17Z" fill="currentColor" />
    </svg>
  );
}

export function Book({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 4h6a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm14 0h-6a3 3 0 0 0-3 3v13h6a3 3 0 0 0 3-3V4Z" fill="currentColor" opacity=".9" />
      <path d="M12 7v13" stroke="var(--color-background)" strokeWidth="1.2" />
    </svg>
  );
}

export function Coffee({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" fill="currentColor" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 4c.6 1-.6 1.5 0 2.5M11 3.5c.6 1-.6 1.5 0 2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Moon({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z" fill="currentColor" />
    </svg>
  );
}

export function Sun({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" />
      </g>
    </svg>
  );
}

export function Calendar({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" fill="currentColor" opacity=".25" />
      <rect x="3.5" y="5" width="17" height="4" rx="2" fill="currentColor" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* Decorative floating backdrop */
export function FloatingDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0" aria-hidden>
      <div className="absolute top-10 left-[18%] text-petal animate-float" style={{ ["--r" as never]: "-10deg" }}>
        <Heart size={20} />
      </div>
      <div className="absolute top-24 right-[18%] text-rose/60 animate-float-slow" style={{ ["--r" as never]: "10deg" }}>
        <Sparkle size={18} />
      </div>
      <div className="absolute top-1/3 left-[8%] text-petal/80 animate-float-slow" style={{ ["--r" as never]: "15deg" }}>
        <Sparkle size={16} />
      </div>
      <div className="absolute top-1/2 right-[6%] text-rose/50 animate-twinkle">
        <Heart size={14} />
      </div>
      <div className="absolute bottom-20 right-[22%] text-petal/70 animate-float">
        <Sparkle size={20} />
      </div>
      <div className="absolute bottom-32 left-[14%] text-rose/40 animate-twinkle">
        <Sparkle size={14} />
      </div>
    </div>
  );
}

export function SparkleBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const bits = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {bits.map((_, i) => {
        const angle = (i / bits.length) * Math.PI * 2;
        const dist = 18 + (i % 3) * 6;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const delay = (i * 0.04).toFixed(2);
        return (
          <span
            key={i}
            className="absolute text-rose"
            style={{
              ["--tx" as never]: `${tx}px`,
              ["--ty" as never]: `${ty}px`,
              animation: `sparkle-burst 1.2s ease-out ${delay}s forwards`,
            }}
          >
            <Sparkle size={i % 2 ? 14 : 10} />
          </span>
        );
      })}
    </div>
  );
}

/* Decorative cluster — 3 sparkles like in reference */
export function SparkleCluster({ className = "" }: { className?: string }) {
  return (
    <span className={"inline-flex items-end gap-0.5 text-rose/70 " + className} aria-hidden>
      <Sparkle size={10} />
      <Sparkle size={16} />
      <Sparkle size={8} />
    </span>
  );
}
