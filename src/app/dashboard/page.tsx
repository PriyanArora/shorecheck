"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BEACHES, EVENTS, STATUS, type Status } from "@/lib/data";
import { hhmm, loadLakes, type Lake, type WeatherPayload } from "@/lib/lakes";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-[62vh] min-h-[420px] w-full rounded-3xl" />,
});

const ORDER: Status[] = ["open", "advisory", "closed", "season"];
const BLOOM = {
  elevated: "Elevated",
  watch: "Watch",
  normal: "Normal",
} as const;

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [lakes, setLakes] = useState<Lake[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/weather")
      .then((r) => r.json())
      .then((j: WeatherPayload) => alive && setWeather(j))
      .catch(() => {});
    loadLakes()
      .then((f) => alive && setLakes(f.lakes.filter((l) => l.satellite.available)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const counts = Object.fromEntries(
    ORDER.map((s) => [s, BEACHES.filter((b) => b.status === s).length]),
  ) as Record<Status, number>;

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-28 pb-24">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.18em] text-white/50 uppercase">
              Today · Sep 12
            </p>
            <h1 className="mt-2 text-5xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">
              Beaches
            </h1>
            <p className="mt-3 max-w-xl text-[17px] leading-snug font-light text-white/65">
              The most recent official sample at every supervised beach. Season testing ended
              Aug 31, so the latest reading is the ruling until next July.
            </p>
          </div>

          <Card className="w-full max-w-sm gap-2 border-white/10 bg-[#1d1d1f] py-4">
            <CardHeader className="px-5">
              <CardDescription className="text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">
                Bloom conditions · regional heuristic
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight text-white">
                {weather ? BLOOM[weather.label] : <Skeleton className="h-7 w-24" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 text-[13px] text-white/60">
              {weather ? (
                <>
                  {weather.rain48} mm rain after {weather.dryRunBefore} dry days
                  {weather.tmaxDry !== null ? `, high ${weather.tmaxDry}°` : ""}
                  <span className="mt-1 block font-mono text-[11px] text-white/40">
                    Halifax Stanfield · updated {hhmm(weather.fetchedAt)}
                  </span>
                </>
              ) : (
                <Skeleton className="h-4 w-48" />
              )}
            </CardContent>
          </Card>
        </header>

        {/* counts */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ORDER.map((s) => (
            <Card key={s} className="gap-1 border-white/10 bg-[#1d1d1f] py-4">
              <CardHeader className="px-5">
                <CardDescription className="flex items-center gap-2 text-[12px] text-white/55">
                  <StatusBadge status={s} short />
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5">
                <p className="text-4xl font-semibold tracking-tight text-white">{counts[s]}</p>
                <p className="mt-0.5 text-[12px] text-white/45">
                  of {BEACHES.length} beaches
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* map */}
        <section className="mt-10">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <MapView />
          </div>
          <p className="mt-2 text-[12px] text-white/40">
            Beach markers use shape and colour. Lake outlines: white for a satellite series
            within its baseline, amber for an unvalidated anomaly, dashed for lakes with no
            series. Click anything for the dated detail.
          </p>
        </section>

        {/* table */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Every beach</h2>
          <p className="mt-1 text-[14px] text-white/55">
            Sorted as the map shows them. Results are the raw count from the lab.
          </p>
          <Card className="mt-5 border-white/10 bg-[#1d1d1f] py-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  {["Beach", "Water", "Status", "Result", "Sampled"].map((h) => (
                    <TableHead
                      key={h}
                      className="h-11 px-5 text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDER.flatMap((s) => BEACHES.filter((b) => b.status === s)).map((b) => (
                  <TableRow key={b.id} className="border-white/10 hover:bg-white/[0.03]">
                    <TableCell className="px-5 py-3.5 text-[14px] font-medium text-white">
                      {b.name}
                    </TableCell>
                    <TableCell className="px-5 text-[13px] text-white/60 capitalize">
                      {b.water}
                    </TableCell>
                    <TableCell className="px-5">
                      <StatusBadge status={b.status} short />
                    </TableCell>
                    <TableCell className="px-5 font-mono text-[12px] text-white/70">
                      {b.result}
                    </TableCell>
                    <TableCell className="px-5 font-mono text-[12px] text-white/45">
                      {b.sampled.replace(/^(Last )?[Ss]ampled /, "")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* lakes */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Lake watch</h2>
          <p className="mt-1 max-w-2xl text-[14px] text-white/55">
            Eight lakes have a Sentinel-2 index series. The value is compared with the lake&apos;s
            own baseline. Unvalidated, and not a safety rating. The rest of the 43 are on the
            map with their reported-sighting history only.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lakes.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))
              : lakes.map((l) => {
                  const s = l.satellite;
                  if (!s.available) return null;
                  return (
                    <Card key={l.key} className="gap-1 border-white/10 bg-[#1d1d1f] py-4">
                      <CardHeader className="px-5">
                        <CardTitle className="text-[15px] font-semibold text-white">
                          {l.name}
                        </CardTitle>
                        <CardDescription className="text-[12px] text-white/50">
                          {s.flag ? "unvalidated anomaly" : "within baseline"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-5 font-mono text-[11px] text-white/45">
                        last clear look {s.last_clear_date}
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </section>

        {/* events */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Happening nearby</h2>
          <p className="mt-1 text-[14px] text-white/55">
            {EVENTS.length} events this week, each tied to a tested beach.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EVENTS.map((e) => {
              const beach = BEACHES.find((b) => b.name === e.near);
              return (
                <Card key={e.id} className="gap-2 border-white/10 bg-[#1d1d1f] py-5">
                  <CardHeader className="px-5">
                    <CardDescription className="font-mono text-[11px] text-white/45">
                      {e.when} · {e.time}
                    </CardDescription>
                    <CardTitle className="text-[16px] font-semibold text-white">
                      {e.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
                    <p className="text-[13px] leading-snug text-white/65">{e.blurb}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-[12px] text-white/50">
                      <span className="truncate">
                        {e.near} · {e.price}
                      </span>
                      {beach && <StatusBadge status={beach.status} short />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <p className="mt-16 text-[12px] text-white/35">
          Status words: {ORDER.map((s) => STATUS[s].label).join(" · ")}. Map data ©
          OpenStreetMap contributors, tiles © CARTO.
        </p>
      </main>
    </>
  );
}
