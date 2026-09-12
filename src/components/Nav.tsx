"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const TREE_URL = "https://halifax-tree-screening.fly.dev/";

const LINKS = [
  { href: "/dashboard", label: "Beaches" },
  { href: "/predict", label: "Predict" },
  { href: "/hugo", label: "Hugo" },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("text-[17px] font-bold tracking-[-0.02em] text-white", className)}
    >
      Shore<span className="text-white/60">Check</span>
    </Link>
  );
}

/**
 * One nav for every page: a clear glass pill floating over the content.
 * "Trees" opens the teammate's app in a sheet on this page, never a new tab.
 */
export function Nav() {
  const path = usePathname();
  const [trees, setTrees] = useState(false);

  const item =
    "flex h-9 items-center rounded-full px-4 text-[13.5px] font-medium transition-[background-color,color] duration-200 ease-out";

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="pointer-events-auto mx-auto flex w-[min(860px,100%)] items-center gap-3 rounded-full border border-white/15 bg-white/10 py-1.5 pr-1.5 pl-5 text-white shadow-[0_18px_40px_-22px_rgba(0,0,0,.8)] backdrop-blur-2xl backdrop-saturate-150">
          <Wordmark />
          <nav aria-label="Primary" className="ms-auto flex items-center gap-0.5">
            {LINKS.map((l) => {
              const on = path === l.href || path.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    item,
                    on ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setTrees(true)}
              aria-haspopup="dialog"
              aria-expanded={trees}
              className={cn(item, "text-white/75 hover:bg-white/10 hover:text-white")}
            >
              Trees
            </button>
          </nav>
        </div>
      </header>

      <Sheet open={trees} onOpenChange={setTrees}>
        <SheetContent
          side="right"
          className="w-[min(1100px,96vw)] gap-0 border-white/10 bg-[#0a0a0a] p-0 sm:max-w-none"
        >
          <SheetHeader className="border-b border-white/10 px-6 py-4">
            <SheetTitle className="text-base font-semibold text-white">
              Which Tree Falls First
            </SheetTitle>
            <SheetDescription className="text-[13px] text-white/60">
              Ranks HRM&apos;s tree-hazard queue so crews go to the branch that will actually hit
              a house. A teammate&apos;s project, running live inside ShoreCheck.
            </SheetDescription>
          </SheetHeader>
          {trees && (
            <iframe
              src={TREE_URL}
              title="Halifax Tree Screening"
              className="h-full w-full flex-1 bg-white"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Kept for the landing hero, same pill. */
export const GlassNav = Nav;
