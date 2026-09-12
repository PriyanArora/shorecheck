"use client";

import { cn } from "@/lib/utils";

/** Aceternity BentoGrid, trimmed to greys. */
export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  eyebrow,
}: {
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-3xl border border-white/10 bg-neutral-900/80 p-6 transition duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_60px_-30px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
            {eyebrow}
          </p>
        )}
        <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-100">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-400">{description}</p>
      </div>
    </div>
  );
}
