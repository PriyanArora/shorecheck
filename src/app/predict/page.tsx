"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hhmm } from "@/lib/lakes";
import { THRESHOLDS, type PredictPayload } from "@/lib/predict";

const th =
  "h-11 px-5 text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase";

export default function PredictPage() {
  const [data, setData] = useState<PredictPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/predict", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData((await r.json()) as PredictPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-28 pb-24">
        <header className="max-w-2xl">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-white/50 uppercase">
            Prediction
          </p>
          <h1 className="mt-2 text-5xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
            Rain in, status out.
          </h1>
          <p className="mt-4 text-[17px] leading-snug font-light text-white/65">
            Beach bacteria follow runoff. The model takes rainfall over the last 48 hours at
            Halifax Stanfield and turns it into a predicted status per water type. Then it
            scores itself against every official sample, so you can see how often it is right
            before you trust it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={run}
              disabled={busy}
              className="h-11 rounded-full bg-white px-6 text-[15px] font-medium text-black hover:bg-white/90"
            >
              {busy ? "Fetching weather…" : data ? "Run again" : "Predict beaches now"}
            </Button>
            {data && (
              <span className="font-mono text-[12px] text-white/45">
                weather as of {data.asOf ?? "n/a"} · fetched {hhmm(data.fetchedAt)}
              </span>
            )}
            {error && <span className="text-[13px] text-red-300">Could not fetch: {error}</span>}
          </div>
        </header>

        {/* rule */}
        <Card className="mt-12 border-white/10 bg-[#1d1d1f] py-5">
          <CardHeader className="px-6">
            <CardDescription className="text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">
              The rule
            </CardDescription>
            <CardTitle className="text-[17px] font-semibold text-white">
              48-hour rainfall against two thresholds per water type
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 px-6 sm:grid-cols-2">
            {(["lake", "ocean"] as const).map((w) => (
              <div key={w}>
                <p className="text-[13px] font-medium text-white/80 capitalize">{w} beaches</p>
                <dl className="mt-2 space-y-1 font-mono text-[12px] text-white/55">
                  <div className="flex justify-between">
                    <dt>under {THRESHOLDS[w].advisory} mm</dt>
                    <dd>
                      <StatusBadge status="open" />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>
                      {THRESHOLDS[w].advisory} to {THRESHOLDS[w].closed} mm
                    </dt>
                    <dd>
                      <StatusBadge status="advisory" />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{THRESHOLDS[w].closed} mm or more</dt>
                    <dd>
                      <StatusBadge status="closed" />
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>

        {busy && !data && (
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* right now */}
            <section className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Right now</h2>
              <p className="mt-1 text-[14px] text-white/55">
                From the last two complete days plus the station&apos;s 24-hour total when it is
                newer.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {(["lake", "ocean"] as const).map((w) => (
                  <Card key={w} className="gap-2 border-white/10 bg-[#1d1d1f] py-5">
                    <CardHeader className="px-5">
                      <CardDescription className="text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">
                        {w} beaches
                      </CardDescription>
                      <CardTitle className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-white">
                        <StatusBadge status={data.now[w].status} className="h-6 text-[13px]" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 text-[13px] text-white/60">
                      {data.now[w].why}
                      <span className="mt-1 block font-mono text-[11px] text-white/40">
                        risk score {data.now[w].score} / 100
                      </span>
                    </CardContent>
                  </Card>
                ))}
                <Card className="gap-2 border-white/10 bg-[#1d1d1f] py-5">
                  <CardHeader className="px-5">
                    <CardDescription className="text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">
                      Scored against official samples
                    </CardDescription>
                    <CardTitle className="text-3xl font-semibold tracking-tight text-white">
                      {data.accuracy.pct === null ? "n/a" : `${data.accuracy.pct}%`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 text-[13px] text-white/60">
                    {data.accuracy.hits} of {data.accuracy.n} tested beaches matched on the day
                    they were sampled.
                    <span className="mt-1 block font-mono text-[11px] text-white/40">
                      {data.now.rain48} mm in 48 h · high {data.now.tmax ?? "n/a"}°
                    </span>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* per beach */}
            <section className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Prediction versus the test, beach by beach
              </h2>
              <p className="mt-1 text-[14px] text-white/55">
                The prediction is recomputed for the day each beach was sampled, then compared
                with what the lab found. Beaches whose season is over cannot be scored.
              </p>
              <Card className="mt-5 border-white/10 bg-[#1d1d1f] py-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      {["Beach", "Sampled", "Official", "Predicted that day", "Match", "Predicted now"].map(
                        (h) => (
                          <TableHead key={h} className={th}>
                            {h}
                          </TableHead>
                        ),
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.beaches.map((b) => (
                      <TableRow key={b.id} className="border-white/10 hover:bg-white/[0.03]">
                        <TableCell className="px-5 py-3.5">
                          <p className="text-[14px] font-medium text-white">{b.name}</p>
                          <p className="text-[11px] text-white/45 capitalize">{b.water}</p>
                        </TableCell>
                        <TableCell className="px-5 font-mono text-[12px] text-white/50">
                          {b.officialDate ?? "—"}
                        </TableCell>
                        <TableCell className="px-5">
                          <StatusBadge status={b.official} short />
                          <p className="mt-1 font-mono text-[11px] text-white/40">
                            {b.officialResult}
                          </p>
                        </TableCell>
                        <TableCell className="px-5">
                          {b.predictedOnSampleDay ? (
                            <StatusBadge status={b.predictedOnSampleDay} />
                          ) : (
                            <span className="text-[12px] text-white/35">outside window</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 text-[13px]">
                          {b.match === null ? (
                            <span className="text-white/35">not scored</span>
                          ) : b.match ? (
                            <span className="text-emerald-300">match</span>
                          ) : (
                            <span className="text-amber-300">miss</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5">
                          <StatusBadge status={b.predictedNow} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </section>

            {/* previous days */}
            <section className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Previous days</h2>
              <p className="mt-1 text-[14px] text-white/55">
                One prediction per complete weather day. Samples and hits count the official
                results dated that day.
              </p>
              <Card className="mt-5 border-white/10 bg-[#1d1d1f] py-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      {["Day", "Rain", "48 h", "High", "Lake", "Ocean", "Samples", "Hits"].map((h) => (
                        <TableHead key={h} className={th}>
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.days.map((d) => (
                      <TableRow key={d.date} className="border-white/10 hover:bg-white/[0.03]">
                        <TableCell className="px-5 py-3 font-mono text-[12px] text-white">
                          {d.date}
                        </TableCell>
                        <TableCell className="px-5 font-mono text-[12px] text-white/60">
                          {d.precip} mm
                        </TableCell>
                        <TableCell className="px-5 font-mono text-[12px] text-white/60">
                          {d.rain48} mm
                        </TableCell>
                        <TableCell className="px-5 font-mono text-[12px] text-white/60">
                          {d.tmax ?? "—"}°
                        </TableCell>
                        <TableCell className="px-5">
                          <StatusBadge status={d.lake} />
                        </TableCell>
                        <TableCell className="px-5">
                          <StatusBadge status={d.ocean} />
                        </TableCell>
                        <TableCell className="px-5 font-mono text-[12px] text-white/60">
                          {d.samples || "—"}
                        </TableCell>
                        <TableCell className="px-5 font-mono text-[12px] text-white/60">
                          {d.samples ? d.hits : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </section>

            <Separator className="mt-16 bg-white/10" />
            <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-white/40">
              The model uses one regional station and rain only. It ignores wind, tide, sun,
              and gull counts, all of which move bacteria. Its job is to be checkable, not to
              replace the lab. Weather © Environment and Climate Change Canada.
            </p>
          </>
        )}
      </main>
    </>
  );
}
