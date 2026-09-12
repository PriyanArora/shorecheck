/**
 * Copernicus Data Space Ecosystem, Sentinel Hub Statistical API.
 * Token: client_credentials. 429 carries Retry-After in milliseconds. Free tier: 10k requests and 10k PU a month.
 */
const TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
const STATS_URL = "https://sh.dataspace.copernicus.eu/api/v1/statistics";

let token: { value: string; expiresAt: number } | null = null;

export function cdseConfigured() {
  return Boolean(process.env.COPERNICUS_CLIENT_ID && process.env.COPERNICUS_CLIENT_SECRET);
}

async function getToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt - 60_000) return token.value;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.COPERNICUS_CLIENT_ID ?? "",
    client_secret: process.env.COPERNICUS_CLIENT_SECRET ?? "",
  });
  const res = await fetch(TOKEN_URL, { method: "POST", body, cache: "no-store" });
  if (!res.ok) throw new Error(`cdse token ${res.status}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, expiresAt: Date.now() + j.expires_in * 1000 };
  return token.value;
}

export type Interval = {
  from: string;
  to: string;
  mean: number;
  sampleCount: number;
  noDataCount: number;
};

/** Daily NDVI over vegetated pixels (SCL == 4) inside a polygon, Sentinel-2 L2A at 20 m. */
export async function ndviDaily(
  geometry: GeoJSON.Polygon,
  from: string,
  to: string,
  maxCloud = 40,
): Promise<Interval[]> {
  const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "SCL", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(s) {
  var veg = s.dataMask === 1 && s.SCL === 4 ? 1 : 0;
  var d = s.B08 + s.B04;
  return { ndvi: [d > 0 ? (s.B08 - s.B04) / d : 0], dataMask: [veg] };
}`;
  const payload = {
    input: {
      bounds: { geometry, properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" } },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: { maxCloudCoverage: maxCloud, mosaickingOrder: "leastCC" },
        },
      ],
    },
    aggregation: {
      timeRange: { from: `${from}T00:00:00Z`, to: `${to}T23:59:59Z` },
      aggregationInterval: { of: "P1D" },
      resolution: { x: 20, y: 20 },
      evalscript,
    },
    calculations: { default: {} },
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(STATS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get("retry-after") ?? 1500);
      await new Promise((r) => setTimeout(r, Math.min(ra, 8000) + 200 * attempt));
      continue;
    }
    if (res.status === 401) {
      token = null;
      continue;
    }
    if (!res.ok) throw new Error(`cdse statistics ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = (await res.json()) as {
      data?: {
        interval: { from: string; to: string };
        outputs?: { ndvi?: { bands?: { B0?: { stats?: { mean: number; sampleCount: number; noDataCount: number } } } } };
      }[];
    };
    return (j.data ?? [])
      .map((d) => {
        const s = d.outputs?.ndvi?.bands?.B0?.stats;
        if (!s || !Number.isFinite(s.mean)) return null;
        return { from: d.interval.from.slice(0, 10), to: d.interval.to.slice(0, 10), mean: s.mean, sampleCount: s.sampleCount, noDataCount: s.noDataCount };
      })
      .filter((x): x is Interval => x !== null);
  }
  throw new Error("cdse statistics: gave up after retries");
}
