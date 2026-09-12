"use client";

import dynamic from "next/dynamic";
import { Nav } from "@/components/Nav";
import { EventMark } from "@/components/StatusMark";
import { EVENTS } from "@/lib/data";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[68vh] min-h-[420px] w-full place-items-center rounded-2xl border border-slate-200 bg-slate-100 font-mono text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

export default function Dashboard() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              Halifax beaches
            </h1>
            <p className="text-sm text-slate-600">
              Water quality from the most recent official sample, plus what's on
              nearby.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500">
            Last updated Sep 11, 10:00 AM
          </p>
        </div>

        <MapView />

        <section className="mt-8">
          <h2 className="font-mono text-sm font-bold tracking-wide text-slate-500 uppercase">
            Upcoming events
          </h2>
          <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
            {EVENTS.map((e) => (
              <article
                key={e.id}
                className="w-64 shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300"
              >
                <p className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wide text-violet-700 uppercase">
                  <EventMark size="size-2.5" /> {e.when}
                </p>
                <h3 className="mt-2 leading-tight font-semibold">{e.title}</h3>
                <p className="font-mono text-[11px] text-slate-500">{e.time}</p>
                <p className="mt-2 text-[13px] leading-snug text-slate-600">
                  {e.blurb}
                </p>
                <p className="mt-3 border-t border-slate-100 pt-2 font-mono text-[11px] text-slate-500">
                  Near {e.near} · {e.price}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
