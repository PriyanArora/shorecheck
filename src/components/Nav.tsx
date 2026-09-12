import Link from "next/link";

export function Wordmark({
  className = "text-slate-900",
  accent = "text-sky-700",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <Link
      href="/"
      className={`text-xl font-bold tracking-tight ${className}`}
    >
      Shore<span className={accent}>Check</span>
    </Link>
  );
}

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/hugo", label: "Talk to Hugo" },
];

/** Liquid-glass pill nav floating over the hero video. */
export function GlassNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50 px-5 pt-[26px]">
      <div className="pointer-events-auto mx-auto flex w-[min(820px,100%)] items-center gap-5 rounded-full bg-white/10 py-3 pr-4 pl-[22px] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.2),0_18px_40px_-22px_rgba(0,0,0,.6)] backdrop-blur-[20px] backdrop-saturate-150">
        <Wordmark
          className="text-[17px] font-extrabold tracking-[-0.01em] text-white"
          accent="text-sky-300"
        />
        <nav aria-label="Primary" className="ms-auto flex gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-10 items-center px-[15px] text-[14.5px] font-semibold text-white/85 transition-[transform,color,filter] duration-200 hover:scale-115 hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-500 border-b border-slate-200 bg-stone-50/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-8 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-700 decoration-sky-600 underline-offset-8 hover:text-slate-900 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
