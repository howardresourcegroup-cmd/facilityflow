// Roomward brand mark — an overhead floor-plan glyph (two rooms + doorway + a live
// "ready" status dot) in the indigo brand gradient. Self-contained SVG: scales from
// favicon size up to hero, and carries its own rounded-square background.

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Roomward" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rw-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="0.5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      {/* tile */}
      <rect width="32" height="32" rx="8" fill="url(#rw-grad)" />
      {/* floor-plan: outer room */}
      <rect x="8.5" y="9.5" width="15" height="13" rx="1.6" stroke="#fff" strokeWidth="2" />
      {/* inner wall with a doorway gap below */}
      <path d="M16 9.5 V15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      {/* live "ready" status dot */}
      <circle cx="12.1" cy="18.4" r="1.6" fill="#34d399" />
    </svg>
  );
}

// Mark + wordmark, for headers and the auth screen.
export function Logo({ className = "", markClassName = "h-8 w-8", textClassName = "text-lg font-bold text-foreground" }:
  { className?: string; markClassName?: string; textClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${markClassName} shadow-lg shadow-indigo-500/25 rounded-[8px]`} />
      <span className={textClassName}>Roomward</span>
    </span>
  );
}
