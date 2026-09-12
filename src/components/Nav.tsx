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

const LINKS = [
  { href: "/dashboard", label: "Beaches" },
  { href: "/predict", label: "Predict" },
  { href: "/hugo", label: "Hugo" },
  { href: "/trees", label: "Trees" },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("text-[17px] font-semibold tracking-[-0.02em] text-white", className)}
    >
      Shore<span className="text-[#86868b]">Check</span>
    </Link>
  );
}

/**
 * One nav for every page: a clear glass pill floating over the content.
 * Desktop shows the links inline. Phones get a three-line button that opens a sidebar.
 */
export function Nav() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);

  const isOn = (href: string) => path === href || path.startsWith(`${href}/`);
  const item =
    "flex h-9 items-center rounded-full px-4 text-[13.5px] font-medium transition-[background-color,color] duration-200 ease-out";

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="pointer-events-auto mx-auto flex w-[min(860px,100%)] items-center gap-3 rounded-full border border-white/15 bg-white/10 py-1.5 pr-1.5 pl-5 text-white shadow-[0_18px_40px_-22px_rgba(0,0,0,.8)] backdrop-blur-2xl backdrop-saturate-150">
          <Wordmark />

          {/* desktop */}
          <nav aria-label="Primary" className="ms-auto hidden items-center gap-0.5 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isOn(l.href) ? "page" : undefined}
                className={cn(
                  item,
                  isOn(l.href)
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* phone: three lines, same height as a nav item */}
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menu}
            className="ms-auto flex h-9 w-11 flex-col items-center justify-center gap-[5px] rounded-full text-white/85 transition-[background-color] duration-200 ease-out hover:bg-white/10 sm:hidden"
          >
            <span className="block h-[1.5px] w-[18px] rounded-full bg-current" />
            <span className="block h-[1.5px] w-[18px] rounded-full bg-current" />
            <span className="block h-[1.5px] w-[18px] rounded-full bg-current" />
          </button>
        </div>
      </header>

      {/* phone sidebar */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent
          side="left"
          className="w-[min(320px,85vw)] gap-0 border-white/10 bg-[#0a0a0a]/95 p-0 backdrop-blur-2xl"
        >
          <SheetHeader className="border-b border-white/10 px-6 py-5">
            <SheetTitle className="text-[17px] font-semibold text-white">
              Shore<span className="text-[#86868b]">Check</span>
            </SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
          </SheetHeader>
          <nav aria-label="Primary" className="flex flex-col px-3 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenu(false)}
                aria-current={isOn(l.href) ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center rounded-2xl px-4 text-[17px] font-medium transition-[background-color] duration-200 ease-out",
                  isOn(l.href) ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

    </>
  );
}

export const GlassNav = Nav;
