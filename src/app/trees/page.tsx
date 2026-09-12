"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { daysSince, hhmm } from "@/lib/lakes";
import { LABEL_TEXT, type CanopyLabel, type Look, type ParkHealth, type TreeHealthPayload } from "@/lib/trees";
import { cn } from "@/lib/utils";

const DOT: Record<CanopyLabel, string> = {
  greener: "bg-emerald-300",
  typical: "bg-emerald-400",
  below: "bg-amber-400",
  stressed: "bg-red-400",
};

function LabelBadge({ l }: { l: CanopyLabel | null }) {
  if (!l) {
    return (
      <Badge variant="outline" className="border-white/15 text-[#86868b]">
        no clear look yet
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 border-white/15 text-[#f5f5f7]">
      <span className={cn("size-1.5 rounded-full", DOT[l])} />
      {LABEL_TEXT[l]}
    </Badge>
  );
}

/** Clear looks in the window as dots, baseline as a dashed line. Nothing drawn between looks. */
function Spark({ looks, baseline }: { looks: Look[]; baseline: number | null }) {
  const W = 260;
  const H = 44;
  if (looks.length < 1) return null;
  const vals = looks.map((l) => l.ndvi).concat(baseline !== null ? [baseline] : []);
  const lo = Math.min(...vals) - 0.02;
  const hi = Math.max(...vals) + 0.02;
  const t0 = new Date(looks[0].date).getTime();
  const t1 = new Date(looks[looks.length - 1].date).getTime();
  const x = (d: string) => (looks.length === 1 ? W / 2 : ((new Date(d).getTime() - t0) / Math.max(1, t1 - t0)) * (W - 8) + 4);
  const y = (v: number) => H - 4 - ((v - lo) / Math.max(1e-6, hi - lo)) * (H - 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-11 w-full" role="img" aria-label="NDVI clear looks">
      {baseline !== null && (
        <line x1={0} x2={W} y1={y(baseline)} y2={y(baseline)} stroke="#86868b" strokeWidth={0.8} strokeDasharray="3 3" />
      )}
      {looks.length > 1 && (
        <polyline points={looks.map((l) => `${x(l.date).toFixed(1)},${y(l.ndvi).toFixed(1)}`).join(" ")} fill="none" stroke="#f5f5f7" strokeWidth={1} opacity={0.3} />
      )}
      {looks.map((l) => (
        <circle key={l.date} cx={x(l.date)} cy={y(l.ndvi)} r={2} fill="#f5f5f7" />
      ))}
    </svg>
  );
}

function ParkCard({ p }: { p: ParkHealth }) {
  const pct = p.anomaly !== null ? `${p.anomaly >= 0 ? "+" : ""}${(p.anomaly * 100).toFixed(1)}%` : "—";
  return (
    <Card className="gap-0 border-white/10 bg-[#1d1d1f] py-0">
      <CardHeader className="px-5 pt-5">
        <CardDescription className="text-[12px] font-medium text-[#86868b]">{p.area}</CardDescription>
        <CardTitle className="text-[17px] font-semibold text-white">{p.name}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="mt-3 flex items-center justify-between gap-2">
          <LabelBadge l={p.label} />
          <span className={cn("tabular-nums text-[22px] font-semibold tracking-tight", p.anomaly !== null && p.anomaly < -0.05 ? "text-amber-300" : "text-white")}>
            {pct}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
          <div>
            <dt className="text-[#86868b]">NDVI now</dt>
            <dd className="tabular-nums text-[#f5f5f7]">{p.ndviNow !== null ? p.ndviNow.toFixed(3) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[#86868b]">Baseline</dt>
            <dd className="tabular-nums text-[#f5f5f7]">{p.baseline !== null ? p.baseline.toFixed(3) : "—"}</dd>
          </div>
          <div>
            <dt className="text-[#86868b]">Clear looks</dt>
            <dd className="tabular-nums text-[#f5f5f7]">
              {p.looks.length} <span className="text-[#86868b]">/ {p.baselineLooks} prior</span>
            </dd>
          </div>
        </dl>
        <Spark looks={p.looks} baseline={p.baseline} />
        <Separator className="my-3 bg-white/10" />
        <p className="tabular-nums text-[11px] text-[#86868b]">
          {p.lastClearDate
            ? `last clear look ${p.lastClearDate} (${daysSince(p.lastClearDate)} days ago)`
            : p.error
              ? `could not read: ${p.error}`
              : "no clear look in the window"}
        </p>
      </CardContent>
    </Card>
  );
}

export default function TreesPage() {
  const [data, setData] = useState<TreeHealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/trees")
      .then(async (r) => {
        const j = (await r.json()) as TreeHealthPayload & { error?: string };
        if (!r.ok || j.error) throw new Error(j.error ?? `HTTP ${r.status}`);
        return j;
      })
      .then((j) => alive && setData(j))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "failed"));
    return () => {
      alive = false;
    };
  }, []);

  const stressed = data?.parks.filter((p) => p.label === "stressed" || p.label === "below").length ?? 0;
  const latest = data ? data.parks.map((p) => p.lastClearDate).filter((d): d is string => Boolean(d)).sort().at(-1) ?? null : null;

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-28 pb-24">
        <header className="max-w-2xl">
          <p className="text-[19px] font-semibold text-[#86868b]">Trees</p>
          <h1 className="mt-2 text-[44px] leading-[1.08] font-semibold tracking-[-0.003em] text-[#f5f5f7] sm:text-[56px]">
            Canopy health, from orbit.
          </h1>
          <p className="mt-4 text-[21px] leading-[1.19] tracking-[0.011em] text-[#86868b]">
            The same Sentinel-2 satellite that watches the lakes reads the greenness of HRM&apos;s big
            tree canopies. Each park&apos;s NDVI over the last 45 days is compared with the same weeks
            in the two previous summers. A canopy that is much less green than its own past is a
            stress signal worth a site visit.
          </p>
        </header>

        {/* summary */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Parks watched", data ? String(data.parks.length) : null],
            ["Flagged below usual", data ? String(stressed) : null],
            ["Latest clear look", latest ?? (data ? "none" : null)],
            ["Fetched", data ? hhmm(data.fetchedAt) : null],
          ].map(([k, v]) => (
            <Card key={k} className="gap-1 border-white/10 bg-[#1d1d1f] py-4">
              <CardHeader className="px-5">
                <CardDescription className="text-[12px] font-medium text-[#86868b]">{k}</CardDescription>
              </CardHeader>
              <CardContent className="px-5">
                {v === null ? <Skeleton className="h-8 w-20" /> : <p className="tabular-nums text-[28px] font-semibold tracking-tight text-white">{v}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="mt-6 border-red-400/30 bg-[#1d1d1f] py-4">
            <CardContent className="px-5 text-[14px] text-red-300">Could not read the satellite: {error}</CardContent>
          </Card>
        )}

        {/* parks */}
        <section className="mt-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data
              ? data.parks.map((p) => <ParkCard key={p.key} p={p} />)
              : !error && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </section>

        {/* method */}
        <Card className="mt-12 border-white/10 bg-[#1d1d1f] py-5">
          <CardHeader className="px-6">
            <CardDescription className="text-[12px] font-medium text-[#86868b]">How it is computed</CardDescription>
            <CardTitle className="text-[17px] font-semibold text-white">NDVI now against the park&apos;s own past</CardTitle>
          </CardHeader>
          <CardContent className="px-6 text-[14px] leading-relaxed text-[#a1a1a6]">
            <p>
              Sentinel-2 L2A at 20 m, bands B04 and B08, NDVI = (B08 − B04) / (B08 + B04), averaged over pixels the
              scene classifier marks as vegetation, so water, roads and buildings inside each rectangle drop out.
              One value per clear day. {data?.rule ?? ""}
            </p>
            <p className="mt-3">
              What it cannot do: see individual trees, tell drought from disease from early leaf-off, or replace an
              arborist. A drop is a reason to look, not a diagnosis. Clouds hide the ground; the card shows how many
              clear looks the number rests on. Contains modified Copernicus Sentinel data 2024 to 2026.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
