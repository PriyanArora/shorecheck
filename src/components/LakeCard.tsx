"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  clearLooks30d,
  daysSince,
  hhmm,
  sightingsFor,
  type HistoryPoint,
  type Lake,
  type SightingsPayload,
  indexTrend,
  type WeatherPayload,
} from "@/lib/lakes";
import { conditionsSince, FAVOURABLE } from "@/lib/weather";

const LABEL: Record<WeatherPayload["label"], string> = {
  elevated: "Elevated",
  watch: "Watch",
  normal: "Normal",
};

function Row({
  title,
  children,
  stamp,
}: {
  title: string;
  children: React.ReactNode;
  stamp: string;
}) {
  return (
    <div className="py-2.5">
      <Badge
        variant="outline"
        className="h-4 border-white/15 px-1.5 text-[10px] font-medium text-[#86868b]"
      >
        {title}
      </Badge>
      <div className="mt-1.5 text-[12.5px] leading-snug text-[#f5f5f7]">{children}</div>
      <p className="mt-1 tabular-nums text-[10px] text-[#86868b]">{stamp}</p>
    </div>
  );
}

/** 40-px sparkline of the satellite index history; one dot per clear look, nothing between. */
function Sparkline({ history, threshold }: { history: HistoryPoint[]; threshold: number }) {
  const W = 220;
  const H = 40;
  if (history.length < 2) return null;
  const t0 = new Date(history[0].d).getTime();
  const t1 = new Date(history[history.length - 1].d).getTime();
  const vals = history.map((h) => h.v);
  const lo = Math.min(...vals, 0);
  const hi = Math.max(...vals, threshold);
  const x = (d: string) => ((new Date(d).getTime() - t0) / Math.max(1, t1 - t0)) * (W - 4) + 2;
  const y = (v: number) => H - 3 - ((v - lo) / Math.max(1e-9, hi - lo)) * (H - 6);
  const pts = history.map((h) => `${x(h.d).toFixed(1)},${y(h.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-1.5 h-10 w-full" role="img" aria-label="Satellite index history">
      <line x1={0} x2={W} y1={y(threshold)} y2={y(threshold)} stroke="#fbbf24" strokeWidth={0.75} strokeDasharray="2 2" />
      <polyline points={pts} fill="none" stroke="#f5f5f7" strokeWidth={1} opacity={0.35} />
      {history.map((h) => (
        <circle key={h.d} cx={x(h.d)} cy={y(h.v)} r={1.3} fill="#f5f5f7" />
      ))}
    </svg>
  );
}

export function LakeCard({
  lake,
  weather,
  sightings,
}: {
  lake: Lake;
  weather: WeatherPayload | null;
  sightings: SightingsPayload | null;
}) {
  const matches = sightings ? sightingsFor(lake, sightings.entries) : [];
  const latest = matches[matches.length - 1];
  const supervised = /supervised/i.test(lake.access);
  const sat = lake.satellite;
  const since = sat.available && weather ? conditionsSince(weather.days, sat.last_clear_date) : null;
  const trend = sat.available ? indexTrend(sat.history) : null;

  return (
    <div className="px-4 pt-3.5 pb-3">
      <p className="text-[15px] font-semibold text-white">{lake.name}</p>
      <p className="tabular-nums text-[10.5px] text-[#86868b]">
        {lake.area_ha} ha · {lake.access}
      </p>

      <div className="mt-1.5">
        <Row
          title="Bloom conditions"
          stamp={weather ? `updated ${hhmm(weather.fetchedAt)} · regional heuristic` : "loading"}
        >
          {weather ? (
            <>
              <span className="font-semibold">{LABEL[weather.label]}</span>
              <span className="text-[#a1a1a6]">
                {" "}· {weather.rain48} mm rain after {weather.dryRunBefore} dry days
              </span>
            </>
          ) : (
            <Skeleton className="h-3.5 w-32" />
          )}
        </Row>
        <Separator className="bg-white/10" />

        <Row
          title="Reported sightings"
          stamp={
            sightings
              ? sightings.parsed
                ? `list checked ${hhmm(sightings.checkedAt)}`
                : `list checked ${hhmm(sightings.checkedAt)}, could not parse`
              : "loading"
          }
        >
          {latest ? (
            <span>
              {latest.when}
              {latest.type ? ` · ${latest.type}` : ""} (2026)
            </span>
          ) : (
            <span className="text-[#a1a1a6]">none listed for 2026</span>
          )}
          {lake.reports && (
            <p className="mt-0.5 text-[11px] leading-snug text-[#86868b]">{lake.reports}</p>
          )}
        </Row>
        <Separator className="bg-white/10" />

        <Row title="Official testing" stamp="season ended Aug 31">
          {supervised ? "supervised beach, tested weekly in season" : "not tested"}
        </Row>
        <Separator className="bg-white/10" />

        <Row
          title="Satellite"
          stamp={
            sat.available
              ? `last clear look ${sat.last_clear_date} (${daysSince(sat.last_clear_date)} days ago)`
              : lake.measurable
                ? "no series pulled yet"
                : "not measurable"
          }
        >
          {sat.available ? (
            <>
              <span className={sat.flag ? "font-semibold text-amber-300" : ""}>
                {sat.flag ? "unvalidated anomaly" : "within baseline"}
              </span>
              <span className="text-[#a1a1a6]"> · {clearLooks30d(sat.history)} clear looks last 30 d</span>
              {trend && (
                <p className={`mt-0.5 text-[11.5px] ${trend === "rising" ? "font-semibold text-amber-300" : "text-[#a1a1a6]"}`}>
                  index {trend} across the last 3 looks
                </p>
              )}
              <Sparkline history={sat.history} threshold={sat.threshold} />
            </>
          ) : lake.measurable ? (
            <span className="text-[#a1a1a6]">no series pulled yet</span>
          ) : (
            <span className="text-[#a1a1a6]">
              too small for satellite ({lake.interior_px20} interior px)
            </span>
          )}
        </Row>

        {sat.available && (
          <>
            <Separator className="bg-white/10" />
            <Row
              title="Since last clear look"
              stamp={
                weather
                  ? `rule: ${FAVOURABLE.dry}+ warm dry days then ${FAVOURABLE.rain}+ mm in 48 h · 2023-25 backtest: fired before 31 of 41 reported lake-months, on 19% of summer days · not a probability`
                  : "loading"
              }
            >
              {!weather ? (
                <Skeleton className="h-3.5 w-32" />
              ) : since ? (
                <span className="font-semibold text-amber-300">
                  Conditions favourable for bloom development: {since.warmDryDays} warm dry days, then{" "}
                  {since.rain48} mm on {since.date}
                </span>
              ) : (
                <span className="text-[#a1a1a6]">
                  No favourable sequence in the weather since {sat.last_clear_date}
                </span>
              )}
            </Row>
          </>
        )}
      </div>

      <Separator className="bg-white/10" />
      <p className="pt-2 tabular-nums text-[9.5px] text-[#6e6e73]">
        Satellite index unvalidated. Not a safety rating.
      </p>
    </div>
  );
}
