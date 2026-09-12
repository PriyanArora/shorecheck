import Link from "next/link";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Spotlight } from "@/components/aceternity/spotlight";
import { TextGenerate } from "@/components/aceternity/text-generate";
import { BEACHES } from "@/lib/data";

const pill =
  "inline-flex h-11 items-center rounded-full px-6 text-[15px] font-medium transition-[background-color,color,transform] duration-200 ease-out";

export default function Landing() {
  const counts = {
    open: BEACHES.filter((b) => b.status === "open").length,
    advisory: BEACHES.filter((b) => b.status === "advisory").length,
    closed: BEACHES.filter((b) => b.status === "closed").length,
  };

  return (
    <>
      <Nav />

      {/* hero: the video stays */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-black/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black" />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-white/60 uppercase">
            Halifax Regional Municipality
          </p>
          <h1 className="mt-4 text-6xl font-bold tracking-[-0.03em] text-white sm:text-7xl lg:text-8xl">
            ShoreCheck
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-snug font-light text-white/85 sm:text-2xl">
            <TextGenerate
              words="Official beach tests. A rain-driven prediction you can check against them. A satellite watch on the lakes nobody tests."
              delay={0.2}
            />
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className={`${pill} bg-white text-black hover:bg-white/90`}>
              See today&apos;s beaches
            </Link>
            <Link
              href="/predict"
              className={`${pill} border border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/20`}
            >
              Run a prediction
            </Link>
          </div>
          <p className="mt-8 text-[13px] text-white/55">
            Right now: {counts.open} open · {counts.advisory} on advisory · {counts.closed} closed ·
            season testing ended Aug 31
          </p>
        </div>
      </section>

      {/* four signals */}
      <section className="relative overflow-hidden bg-black px-6 py-24 sm:py-32">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
        <div className="mx-auto max-w-6xl">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            What you get
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Four signals. Each one dated.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed font-light text-white/65">
            Nothing here is interpolated or guessed between readings. Every number carries the
            time it was taken, so you can decide how much to trust it.
          </p>

          <BentoGrid className="mt-14">
            <BentoGridItem
              className="md:col-span-2"
              eyebrow="Official tests"
              title="12 supervised beaches, sampled by HRM"
              description="E. coli for lakes, Enterococci for the ocean, weekly from July 1 to Aug 31. This is the only signal that is a ruling; everything else is context."
              header={
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/40">
                  {BEACHES.slice(2, 5).map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="truncate text-sm text-white/85">{b.name}</span>
                      <span className="hidden font-mono text-[11px] text-white/45 sm:inline">
                        {b.result}
                      </span>
                      <StatusBadge status={b.status} short />
                    </li>
                  ))}
                </ul>
              }
            />
            <BentoGridItem
              eyebrow="Prediction"
              title="Rain in, status out"
              description="48-hour rainfall at Halifax Stanfield, thresholded per water type. Scored against every official sample so you can see how often it is right."
              header={
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="font-mono text-[11px] text-white/45">lake · ocean thresholds</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    10 <span className="text-white/40">/</span> 25
                    <span className="ml-3 text-base font-normal text-white/50">mm</span>
                  </p>
                  <p className="mt-1 text-[12px] text-white/55">advisory / closed, lake beaches</p>
                </div>
              }
            />
            <BentoGridItem
              eyebrow="Lake watch"
              title="43 lakes, 8 with a satellite series"
              description="Sentinel-2 index per lake, median 10 days between clear looks. Shown as the date of the last clear look, never as a live reading."
              header={
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="font-mono text-[11px] text-white/45">last clear look</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">Sep 11</p>
                  <p className="mt-1 text-[12px] text-white/55">Lake Echo · others Aug 30</p>
                </div>
              }
            />
            <BentoGridItem
              className="md:col-span-2"
              eyebrow="Hugo"
              title="Ask for a beach in plain words"
              description="Peaceful or busy, kids or surf, car or bus. Hugo answers from the same tested data as the map, and says so when a beach is on advisory."
              header={
                <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="self-end rounded-2xl rounded-tr-sm bg-white px-3 py-1.5 text-[13px] text-black">
                    somewhere quiet with kids?
                  </p>
                  <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#2c2c2e] px-3 py-1.5 text-[13px] text-white/90">
                    Birch Cove. Shallow, warm, and tested clean this morning.
                  </p>
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* how the numbers are made */}
      <section className="border-t border-white/10 bg-black px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
          {[
            [
              "Sources",
              "HRM beach sampling for the rulings. Environment and Climate Change Canada, station Halifax Stanfield, for rain and temperature. Nova Scotia's reported blue-green algae list. Sentinel-2 L1C for the lake index.",
            ],
            [
              "Cadence",
              "Beach samples weekly in season. Weather daily, with a one to two day lag, plus an hourly station reading. Province list checked every 30 minutes. Satellite whenever the sky is clear, about every 10 days.",
            ],
            [
              "Caveats",
              "The prediction is rain only and is scored openly against the tests. The satellite index is unvalidated: backtest hit rate 3 of 28. None of this is a safety rating. The official sample is.",
            ],
          ].map(([h, p]) => (
            <div key={h}>
              <h3 className="text-[13px] font-semibold tracking-[0.18em] text-white/50 uppercase">
                {h}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75">{p}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-8">
        <p className="mx-auto max-w-6xl text-[12px] text-white/40">
          Map data © OpenStreetMap contributors, tiles © CARTO. Weather © Environment and Climate
          Change Canada. Built at a Halifax hackathon.
        </p>
      </footer>
    </>
  );
}
