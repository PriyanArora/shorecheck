import type { WeatherPayload } from "@/lib/lakes";
import { bloomConditions, fetchDaily, fetchHourly } from "@/lib/weather";

const CACHE_MS = 10 * 60 * 1000;
let cache: { at: number; body: WeatherPayload } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) return Response.json(cache.body);

  const [rows, hourly] = await Promise.all([fetchDaily(16), fetchHourly()]);
  const body: WeatherPayload = {
    ...bloomConditions(rows, hourly),
    hourly: { time: hourly.time, airTemp: hourly.airTemp },
    station: "Halifax Stanfield (regional)",
    fetchedAt: new Date().toISOString(),
  };
  cache = { at: Date.now(), body };
  return Response.json(body);
}
