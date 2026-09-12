/** ECCC Halifax Stanfield (regional). Keyless. Daily rows lag 1-2 days; SWOB is same-hour. */
const STATION = "8202251";

export type DailyRow = {
  date: string; // YYYY-MM-DD
  tmax: number | null;
  tmin: number | null;
  precip: number; // mm, rows with null precip are dropped
};

export type Hourly = { time: string | null; airTemp: number | null; pcpn24: number | null };

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const num = (v: unknown) =>
  v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v);

export async function fetchDaily(days = 16): Promise<DailyRow[]> {
  const today = new Date();
  const start = new Date(today.getTime() - days * 86_400_000);
  const url =
    `https://api.weather.gc.ca/collections/climate-daily/items?CLIMATE_IDENTIFIER=${STATION}` +
    `&datetime=${ymd(start)}/${ymd(today)}&f=json&limit=100&sortby=LOCAL_DATE`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { features?: { properties: Record<string, unknown> }[] };
    return (json.features ?? [])
      .map((f) => f.properties)
      .filter((p) => num(p.TOTAL_PRECIPITATION) !== null)
      .map((p) => ({
        date: String(p.LOCAL_DATE).slice(0, 10),
        tmax: num(p.MAX_TEMPERATURE),
        tmin: num(p.MIN_TEMPERATURE),
        precip: num(p.TOTAL_PRECIPITATION) as number,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

export async function fetchHourly(): Promise<Hourly> {
  const url =
    `https://api.weather.gc.ca/collections/swob-realtime/items?clim_id-value=${STATION}` +
    `&f=json&limit=1&sortby=-date_tm-value`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { time: null, airTemp: null, pcpn24: null };
    const json = (await res.json()) as { features?: { properties: Record<string, unknown> }[] };
    const p = json.features?.[0]?.properties ?? {};
    return {
      time: (p["date_tm-value"] as string | undefined) ?? null,
      airTemp: num(p["air_temp-value"]),
      pcpn24: num(p["pcpn_amt_pst24hrs-value"]),
    };
  } catch {
    return { time: null, airTemp: null, pcpn24: null };
  }
}

/** Rain over the last two complete days, plus the SWOB 24 h total when it is newer than the last complete day. */
export function rain48Now(rows: DailyRow[], hourly: Hourly): number {
  const last = rows.length ? rows[rows.length - 1].date : null;
  let r = rows.slice(-2).reduce((s, x) => s + x.precip, 0);
  if (hourly.pcpn24 !== null && hourly.time && last && hourly.time.slice(0, 10) > last) {
    r += hourly.pcpn24;
  }
  return Math.round(r * 10) / 10;
}

export type BloomLabel = "elevated" | "watch" | "normal";

/** Province wording: "a period of hot, dry weather followed by heavy rainfall". Thresholds are our heuristic. */
export function bloomConditions(rows: DailyRow[], hourly: Hourly) {
  const lastCompleteDay = rows.length ? rows[rows.length - 1].date : null;
  const rain48 = rain48Now(rows, hourly);

  let lastRainIdx = -1;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].precip >= 1) {
      lastRainIdx = i;
      break;
    }
  }
  const before = lastRainIdx === -1 ? rows : rows.slice(0, lastRainIdx);
  let dryRunBefore = 0;
  let tmaxDry: number | null = null;
  for (let i = before.length - 1; i >= 0; i--) {
    if (before[i].precip >= 1) break;
    dryRunBefore++;
    const t = before[i].tmax;
    if (t !== null && (tmaxDry === null || t > tmaxDry)) tmaxDry = t;
  }

  const t = tmaxDry ?? -Infinity;
  let label: BloomLabel = "normal";
  if (rain48 >= 15 && dryRunBefore >= 5 && t >= 22) label = "elevated";
  else if (rain48 >= 15 || (dryRunBefore >= 7 && t >= 25)) label = "watch";

  return { label, rain48, dryRunBefore, tmaxDry, lastCompleteDay };
}
