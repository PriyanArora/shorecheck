import { BEACHES } from "@/lib/data";
import {
  comparable,
  predictStatus,
  sampledDate,
  type BeachComparison,
  type DayPrediction,
  type PredictPayload,
} from "@/lib/predict";
import { fetchDaily, fetchHourly, rain48Now } from "@/lib/weather";

const CACHE_MS = 10 * 60 * 1000;
let cache: { at: number; body: PredictPayload } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) return Response.json(cache.body);

  const [rows, hourly] = await Promise.all([fetchDaily(20), fetchHourly()]);
  const asOf = rows.length ? rows[rows.length - 1].date : null;

  // one prediction per complete day, from that day's rain plus the day before
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const days: DayPrediction[] = rows.slice(-14).map((r, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : byDate.get(shift(r.date, -1));
    const rain48 = Math.round((r.precip + (prev?.precip ?? 0)) * 10) / 10;
    return {
      date: r.date,
      precip: r.precip,
      rain48,
      tmax: r.tmax,
      lake: predictStatus("lake", rain48, r.tmax).status,
      ocean: predictStatus("ocean", rain48, r.tmax).status,
      samples: 0,
      hits: 0,
    };
  });
  const dayByDate = new Map(days.map((d) => [d.date, d]));

  const rain48 = rain48Now(rows, hourly);
  const tmaxNow = rows.length ? rows[rows.length - 1].tmax : null;
  const now = {
    rain48,
    tmax: tmaxNow,
    lake: predictStatus("lake", rain48, tmaxNow),
    ocean: predictStatus("ocean", rain48, tmaxNow),
  };

  let n = 0;
  let hits = 0;
  const beaches: BeachComparison[] = BEACHES.map((b) => {
    const officialDate = sampledDate(b);
    const day = officialDate ? dayByDate.get(officialDate) : undefined;
    const predictedOnSampleDay = day ? day[b.water] : null;
    let match: boolean | null = null;
    if (comparable(b.status) && predictedOnSampleDay) {
      match = predictedOnSampleDay === b.status;
      n++;
      if (match) hits++;
      if (day) {
        day.samples++;
        if (match) day.hits++;
      }
    }
    return {
      id: b.id,
      name: b.name,
      water: b.water,
      official: b.status,
      officialResult: b.result,
      officialDate,
      predictedOnSampleDay,
      predictedNow: now[b.water].status,
      match,
    };
  });

  const body: PredictPayload = {
    fetchedAt: new Date().toISOString(),
    station: "Halifax Stanfield (regional)",
    asOf,
    now,
    days: days.reverse(),
    beaches,
    accuracy: { n, hits, pct: n ? Math.round((hits / n) * 100) : null },
  };
  cache = { at: Date.now(), body };
  return Response.json(body);
}

function shift(date: string, days: number) {
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}
