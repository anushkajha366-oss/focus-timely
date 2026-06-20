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
      <path
        d="M12 12c-3-3-7-3.5-7-.5S8 15 12 12s7 .5 7-2.5-4-2.5-7 .5Z"
        fill="currentColor"
        opacity=".85"
      />
      <circle cx="12" cy="12" r="1.6" fill="var(--color-background)" />
      <path d="M11 14c-.6 2.2-1 3.6-1.4 4.6M13 14c.6 2.2 1 3.6 1.4 4.6"
        stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Heart({ size = 18, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Star({ size = 16, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M12 3.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Sparkle({ size = 14, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M12 2c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Flower({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <g fill="currentColor">
        <circle cx="12" cy="6"  r="3" opacity=".85" />
        <circle cx="6"  cy="12" r="3" opacity=".85" />
        <circle cx="18" cy="12" r="3" opacity=".85" />
        <circle cx="12" cy="18" r="3" opacity=".85" />
      </g>
      <circle cx="12" cy="12" r="2.4" fill="var(--color-background)" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Cloud({ size = 26, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M7 17h11a3.5 3.5 0 0 0 .4-6.97A5 5 0 0 0 8.6 9.2 4 4 0 0 0 7 17Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Book({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path
        d="M5 4h6a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm14 0h-6a3 3 0 0 0-3 3v13h6a3 3 0 0 0 3-3V4Z"
        fill="currentColor" opacity=".9"
      />
      <path d="M12 7v13" stroke="var(--color-background)" strokeWidth="1.2" />
    </svg>
  );
}

export function Coffee({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" fill="currentColor" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 4c.6 1-.6 1.5 0 2.5M11 3.5c.6 1-.6 1.5 0 2.5"
            stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Plant({ size = 22, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M7 20h10l-1-7H8l-1 7Z" fill="currentColor" opacity=".9" />
      <path d="M12 13c0-4 3-6 6-6-.5 4-3 6-6 6Z" fill="currentColor" opacity=".7" />
      <path d="M12 13c0-4-3-6-6-6 .5 4 3 6 6 6Z" fill="currentColor" opacity=".7" />
      <path d="M12 13V8" stroke="currentColor" strokeWidth="1.5" />
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

/* ---------- Decorative floating backdrop ---------- */

export function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0" aria-hidden>
      <div className="absolute top-10 left-[6%] text-petal animate-float" style={{ ["--r" as never]: "-12deg" }}>
        <Flower size={28} />
      </div>
      <div className="absolute top-24 right-[8%] text-rose/70 animate-float-slow" style={{ ["--r" as never]: "10deg" }}>
        <Heart size={22} />
      </div>
      <div className="absolute top-1/2 left-[4%] text-petal animate-float-slow" style={{ ["--r" as never]: "20deg" }}>
        <Star size={20} />
      </div>
      <div className="absolute top-[38%] right-[5%] text-rose/60 animate-twinkle">
        <Sparkle size={18} />
      </div>
      <div className="absolute bottom-20 right-[12%] text-petal animate-float" style={{ ["--r" as never]: "-6deg" }}>
        <Cloud size={36} />
      </div>
      <div className="absolute bottom-16 left-[10%] text-rose/60 animate-twinkle">
        <Sparkle size={14} />
      </div>
    </div>
  );
}

/* ---------- Sparkle burst on session complete ---------- */

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

/* ---------- Hero study illustration ---------- */

export function StudyScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* desk */}
      <rect x="10" y="120" width="200" height="6" rx="3" fill="var(--petal)" />
      {/* stack of books */}
      <g>
        <rect x="22" y="100" width="58" height="14" rx="4" fill="var(--rose)" opacity=".85" />
        <rect x="28" y="86"  width="58" height="14" rx="4" fill="var(--petal)" />
        <rect x="20" y="72"  width="58" height="14" rx="4" fill="var(--rose)" opacity=".55" />
        <circle cx="74" cy="79" r="2" fill="var(--color-background)" />
      </g>
      {/* mug */}
      <g transform="translate(110,82)">
        <rect x="0" y="6" width="34" height="32" rx="8" fill="var(--rose)" />
        <path d="M34 14h5a6 6 0 0 1 0 12h-5" stroke="var(--rose)" strokeWidth="3" fill="none" />
        <path d="M10 0c1 3-1 4 0 7M18 -2c1 3-1 4 0 7M26 0c1 3-1 4 0 7"
              stroke="var(--petal)" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 18h18" stroke="var(--color-background)" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      </g>
      {/* plant */}
      <g transform="translate(168,70)">
        <path d="M6 50h22l-3-22H9L6 50Z" fill="var(--rose)" opacity=".8" />
        <path d="M17 28c0-12 8-18 18-18-1 12-9 18-18 18Z" fill="var(--petal)" />
        <path d="M17 28c0-12-8-18-18-18 1 12 9 18 18 18Z" fill="var(--petal)" />
        <path d="M17 28V12" stroke="var(--rose)" strokeWidth="2" />
      </g>
      {/* sparkles */}
      <g fill="var(--rose)" opacity=".7">
        <path d="M62 40c.4 2.4 1.6 3.6 4 4-2.4.4-3.6 1.6-4 4-.4-2.4-1.6-3.6-4-4 2.4-.4 3.6-1.6 4-4Z" />
        <path d="M132 28c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z" />
      </g>
    </svg>
  );
}
