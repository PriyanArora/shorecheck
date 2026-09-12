import { readFile } from "node:fs/promises";
import path from "node:path";
import { cdseConfigured, ndviDaily, type Interval } from "@/lib/cdse";
import { labelFor, median, PARKS, type Look, type ParkHealth, type TreeHealthPayload } from "@/lib/trees";

/** Tree-canopy health per park from Sentinel-2 NDVI. Cached 6 h; the satellite only revisits every few days anyway. */
const CACHE_MS = 6 * 60 * 60 * 1000;
const WINDOW_DAYS = 45;
const BASELINE_YEARS = 2;
let cache: { at: number; body: TreeHealthPayload } | null = null;
let inflight: Promise<TreeHealthPayload> | null = null;

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const shiftYear = (d: string, y: number) => `${Number(d.slice(0, 4)) - y}${d.slice(4)}`;

/** Keep only days where enough vegetated pixels were actually seen (clouds leave few). */
function clearLooks(rows: Interval[]): Look[] {
  const maxValid = Math.max(0, ...rows.map((r) => r.sampleCount - r.noDataCount));
  return rows
    .map((r) => ({ date: r.from, ndvi: r.mean, validPx: r.sampleCount - r.noDataCount }))
    .filter((l) => l.validPx >= Math.max(50, 0.3 * maxValid))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function compute(): Promise<TreeHealthPayload> {
  const now = Date.now();
  const to = iso(now);
  const from = iso(now - WINDOW_DAYS * 86_400_000);
  const years = Array.from({ length: BASELINE_YEARS }, (_, i) => Number(to.slice(0, 4)) - (i + 1));

  const parks: ParkHealth[] = [];
  // three parks at a time keeps well under the 300 requests per minute limit
  for (let i = 0; i < PARKS.length; i += 3) {
    const batch = PARKS.slice(i, i + 3).map(async (p): Promise<ParkHealth> => {
      const base = { key: p.key, name: p.name, area: p.area, window: { from, to }, baselineYears: years };
      try {
        const thisYear = Number(to.slice(0, 4));
        const [cur, ...prior] = await Promise.all([
          ndviDaily(p.geometry, from, to),
          ...years.map((y) => ndviDaily(p.geometry, shiftYear(from, thisYear - y), shiftYear(to, thisYear - y))),
        ]);
        const looks = clearLooks(cur);
        const priorLooks = prior.flatMap(clearLooks);
        const ndviNow = median(looks.map((l) => l.ndvi));
        const baseline = median(priorLooks.map((l) => l.ndvi));
        const anomaly = ndviNow !== null && baseline !== null && baseline !== 0 ? (ndviNow - baseline) / Math.abs(baseline) : null;
        return {
          ...base,
          looks,
          ndviNow,
          baseline,
          baselineLooks: priorLooks.length,
          anomaly,
          label: labelFor(anomaly),
          lastClearDate: looks.length ? looks[looks.length - 1].date : null,
        };
      } catch (e) {
        return { ...base, looks: [], ndviNow: null, baseline: null, baselineLooks: 0, anomaly: null, label: null, lastClearDate: null, error: e instanceof Error ? e.message : "failed" };
      }
    });
    parks.push(...(await Promise.all(batch)));
  }

  return {
    fetchedAt: new Date().toISOString(),
    source: "Sentinel-2 L2A via Copernicus Data Space, Statistical API, 20 m, vegetated pixels only (SCL 4)",
    parks,
    rule: `median NDVI of clear looks in the last ${WINDOW_DAYS} days versus the median of the same window in ${years.join(" and ")}; greener >= +5%, typical to -5%, below to -15%, stress signal under -15%`,
  };
}

/** Last live reading, committed to the repo, so the page still shows real data where no credentials are set. */
async function snapshot(reason: string): Promise<Response> {
  try {
    const raw = await readFile(path.join(process.cwd(), "public", "data", "tree_health.json"), "utf8");
    const body = JSON.parse(raw) as TreeHealthPayload;
    return Response.json({ ...body, snapshot: true, snapshotReason: reason });
  } catch {
    return Response.json({ error: reason }, { status: 503 });
  }
}

export async function GET(req: Request) {
  if (!cdseConfigured()) return snapshot("COPERNICUS credentials not set on this server");
  const refresh = new URL(req.url).searchParams.has("refresh");
  if (!refresh && cache && Date.now() - cache.at < CACHE_MS) return Response.json(cache.body);
  if (!inflight) {
    inflight = compute()
      .then((body) => {
        cache = { at: Date.now(), body };
        return body;
      })
      .finally(() => {
        inflight = null;
      });
  }
  try {
    return Response.json(await inflight);
  } catch (e) {
    return snapshot(e instanceof Error ? e.message : "failed");
  }
}
