import type { SightingEntry, SightingsPayload } from "@/lib/lakes";

const URL = "https://novascotia.ca/blue-green-algae/";
const CACHE_MS = 30 * 60 * 1000;

let cache: { at: number; body: SightingsPayload } | null = null;

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

function parseTable(html: string): SightingEntry[] | null {
  const anchor = html.search(/reported in 2026/i);
  if (anchor === -1) return null;
  const after = html.slice(anchor);
  const m = after.match(/<table[\s\S]*?<\/table>/i);
  if (!m) return null;
  const rows = [...m[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) =>
    [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => strip(c[1])),
  );
  const body = rows.filter((cells) => cells.length >= 2 && !/^lake$/i.test(cells[0] ?? ""));
  // header-driven column pick when a header row exists; else positional
  const header = rows.find((cells) => cells.some((c) => /lake/i.test(c)));
  const idx = (re: RegExp, fallback: number) => {
    const i = header ? header.findIndex((c) => re.test(c)) : -1;
    return i === -1 ? fallback : i;
  };
  const iLake = idx(/lake|water/i, 0);
  const iComm = idx(/community/i, 1);
  const iCounty = idx(/county/i, 2);
  const iWhen = idx(/date|month|reported/i, 3);
  const iType = idx(/type/i, 4);
  return body
    .filter((c) => c !== header)
    .map((c) => ({
      lake: c[iLake] ?? "",
      community: c[iComm] ?? "",
      county: c[iCounty] ?? "",
      when: c[iWhen] ?? "",
      type: c[iType] ?? "",
    }))
    .filter((e) => e.lake);
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) return Response.json(cache.body);

  let entries: SightingEntry[] | null = null;
  try {
    const res = await fetch(URL, {
      cache: "no-store",
      headers: { "User-Agent": "ShoreCheck/0.1 (lake watch; hackathon demo)" },
    });
    if (res.ok) entries = parseTable(await res.text());
  } catch {
    entries = null;
  }

  const body: SightingsPayload = {
    checkedAt: new Date().toISOString(),
    parsed: entries !== null,
    entries: entries ?? [],
  };
  cache = { at: Date.now(), body };
  return Response.json(body);
}
