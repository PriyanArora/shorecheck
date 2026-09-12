export type HistoryPoint = { d: string; v: number };

export type Satellite =
  | {
      available: true;
      last_clear_date: string;
      last_value: number;
      threshold: number;
      baseline_median: number;
      flag: boolean;
      history: HistoryPoint[];
    }
  | { available: false };

export type Lake = {
  key: string;
  name: string;
  area_ha: number;
  lat: number;
  lon: number;
  measurable: boolean;
  interior_px20: number;
  role: string;
  access: string;
  reports: string;
  satellite: Satellite;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
};

export type LakesMeta = {
  generated: string;
  satellite_pulled: string;
  index: string;
  rule: string;
  n_lakes: number;
  n_with_satellite: number;
};

export type LakesFile = { meta: LakesMeta; lakes: Lake[] };

export async function loadLakes(): Promise<LakesFile> {
  const res = await fetch("/data/lakes.json");
  if (!res.ok) throw new Error(`lakes.json ${res.status}`);
  return (await res.json()) as LakesFile;
}

/** Whole days between a YYYY-MM-DD date and now (never negative). */
export function daysSince(dateStr: string): number {
  const then = new Date(`${dateStr}T00:00:00Z`).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / 86_400_000));
}

/** Number of clear satellite looks in the last 30 days. */
export function clearLooks30d(history: HistoryPoint[]): number {
  return history.filter((h) => daysSince(h.d) <= 30).length;
}

/** Weather label heuristic, shared by the API and the UI. */
export type WeatherLabel = "elevated" | "watch" | "normal";

export type WeatherPayload = {
  label: WeatherLabel;
  rain48: number;
  dryRunBefore: number;
  tmaxDry: number | null;
  lastCompleteDay: string | null;
  hourly: { time: string | null; airTemp: number | null };
  station: string;
  fetchedAt: string;
};

export type SightingEntry = {
  lake: string;
  community: string;
  county: string;
  when: string;
  type: string;
};

export type SightingsPayload = {
  checkedAt: string;
  parsed: boolean;
  entries: SightingEntry[];
};

/** Match a provincial list entry to a lake: case-insensitive, name minus "Lake". */
export function sightingsFor(lake: Lake, entries: SightingEntry[]): SightingEntry[] {
  const needle = lake.name.replace(/\blake\b/gi, "").trim().toLowerCase();
  if (!needle) return [];
  return entries.filter((e) => e.lake.toLowerCase().includes(needle));
}

export function hhmm(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
