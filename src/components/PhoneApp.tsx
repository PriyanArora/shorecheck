"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { HugoChat } from "@/components/HugoChat";
import { EventMark } from "@/components/StatusMark";
import { EVENTS } from "@/lib/data";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#eaf4fa] text-xs text-sky-900/60">
      Loading map…
    </div>
  ),
});

type Tab = "map" | "hugo";

/** The whole product, running inside the phone: swipe up to open the app. */
export function PhoneApp() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("map");
  const startY = useRef(0);

  // deep link for demos: /#app opens straight into the dashboard
  useEffect(() => {
    const h = window.location.hash;
    if (h === "#app" || h === "#hugo") setOpen(true);
    if (h === "#hugo") setTab("hugo");
  }, []);

  return (
    <div className="relative h-full overflow-hidden bg-[#f4ecdd]">
      {/* app */}
      <div className="flex h-full flex-col">
        <nav className="absolute inset-x-3 top-[var(--island)] z-1400 flex h-8 items-center gap-1 rounded-full bg-white/50 pr-1 pl-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,.7),0_8px_20px_-12px_rgba(7,89,133,.6)] backdrop-blur-lg backdrop-saturate-150">
          <span className="text-[12px] font-bold tracking-tight text-slate-900">
            Shore<span className="text-sky-700">Check</span>
          </span>
          <div className="ms-auto flex gap-0.5">
            {(["map", "hugo"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-current={tab === t ? "page" : undefined}
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap transition ${
                  tab === t
                    ? "bg-sky-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t === "map" ? "Map" : "Talk to Hugo"}
              </button>
            ))}
          </div>
        </nav>

        {tab === "map" ? (
          <div className="flex h-full flex-col gap-2.5 px-3 pb-5 pt-[calc(var(--island)+2.6rem)]">
            {/* map lives in a card */}
            <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] ring-1 ring-white/80 shadow-[0_10px_30px_-14px_rgba(7,89,133,.45)]">
              <MapView compact />
            </div>

            <div className="shrink-0">
              <div className="flex items-baseline justify-between px-1">
                <p className="text-[10px] font-bold tracking-[0.12em] text-sky-900/70 uppercase">
                  Happening nearby
                </p>
                <p className="text-[10px] text-slate-500">{EVENTS.length} events</p>
              </div>
              <div className="mt-1.5 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {EVENTS.map((e) => (
                  <article
                    key={e.id}
                    className="w-[8.5rem] shrink-0 snap-start rounded-2xl bg-white/85 p-2.5 ring-1 ring-[#e7d6b3]"
                  >
                    <p className="flex items-center gap-1.5 text-[9.5px] font-bold text-violet-700">
                      <EventMark size="size-2" /> {e.when}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-tight font-bold text-slate-900">
                      {e.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{e.time}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full pt-[calc(var(--island)+2.6rem)]">
            <HugoChat compact />
          </div>
        )}
      </div>

      {/* intro, swipe up to dismiss: sky meets sand at the horizon */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Swipe up to open ShoreCheck"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
        onWheel={(e) => e.deltaY > 8 && setOpen(true)}
        onPointerDown={(e) => (startY.current = e.clientY)}
        onPointerUp={(e) => startY.current - e.clientY > 40 && setOpen(true)}
        onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
        onTouchEnd={(e) =>
          startY.current - e.changedTouches[0].clientY > 40 && setOpen(true)
        }
        className={`absolute inset-0 z-1500 flex touch-none flex-col items-center justify-end overflow-hidden bg-[linear-gradient(to_bottom,#bfe0f5_0%,#e6f2fa_52%,#f1e6cf_52%,#e2cfa6_100%)] px-7 pb-[18%] text-center transition-transform duration-500 ease-out ${
          open ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* low sun */}
        <span className="absolute top-[36%] left-1/2 size-24 -translate-x-1/2 rounded-full bg-[#fde7b4] blur-md" />
        <span className="absolute top-[52%] inset-x-0 h-px bg-white/70" />

        <h2 className="relative text-[2.1rem] font-bold tracking-tight text-slate-900">
          <span className="text-[#a97c3f]">Shore</span>
          <span className="text-sky-800">Check</span>
        </h2>
        <p className="relative mt-2 max-w-[17rem] text-[13px] leading-snug text-slate-700">
          Today's water quality at every supervised beach in Halifax, what's on
          nearby, and Hugo to pick one for you.
        </p>
        <span className="relative mt-8 animate-bounce text-lg text-sky-900/60">↑</span>
        <span className="relative text-[10.5px] font-semibold tracking-[0.14em] text-sky-900/60 uppercase">
          Swipe up
        </span>
      </div>
    </div>
  );
}
