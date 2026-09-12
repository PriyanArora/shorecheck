# ShoreCheck + Lake Watch: 30-minute build flow

Goal: inside the existing iPhone frame (`src/components/PhoneFrame.tsx` → `PhoneApp.tsx` → `MapView.tsx`), add a **lake layer** with
four honestly-timestamped signals per lake. Three are live (weather, provincial sightings list, HRM season status); one is slow
(Sentinel-2 index, pre-pulled). Nothing is interpolated. Nothing says "safe", "current", "toxic", "pets".

Stack facts: Next.js **16.3.5** (read `node_modules/next/dist/docs/` first, per AGENTS.md), React 19, Tailwind 4, react-leaflet 5.
`node_modules` is missing → `npm install` first. Fonts and Leaflet CSS already wired in `globals.css`.

## Inputs already on disk (do not regenerate)
- `public/data/lakes.json` — `{meta, lakes[]}`; each lake: `key, name, area_ha, lat, lon, measurable, interior_px20, role, access,
  reports (text), satellite {available, last_clear_date, last_value, threshold, baseline_median, flag, history[{d,v}]}, geometry (GeoJSON WGS84)`.
  43 lakes, 8 with satellite history (grand, wrights, elbow, sandy_bedford, first_sackville, echo, thomas, kinsac).
- `public/data/ns_reported_bga_all.csv` — provincial reports 2023-25: `lake_community, county, month, year, type`.
- Evidence: `../feasibility/VERDICT.md`, `../feasibility/plots/gate5_bloom_index_timeseries.png` (copy to `public/evidence.png` if used).

## Step 1 (5 min) — install and types
`npm install`. Add `src/lib/lakes.ts`: `type Lake`, `loadLakes()` (fetch `/data/lakes.json`), helpers
`daysSince(dateStr)`, `clearLooks30d(history)`.

## Step 2 (7 min) — two route handlers (App Router, `export async function GET()`)
### `src/app/api/weather/route.ts` (regional, one station, cache 10 min)
- Daily: `https://api.weather.gc.ca/collections/climate-daily/items?CLIMATE_IDENTIFIER=8202251&datetime=<today-16d>/<today>&f=json&limit=100&sortby=LOCAL_DATE`
  → rows `{LOCAL_DATE, MAX_TEMPERATURE, MIN_TEMPERATURE, TOTAL_PRECIPITATION}`; drop rows where precip is null (today/yesterday are often null: 1-2 day lag).
- Hourly (today): `https://api.weather.gc.ca/collections/swob-realtime/items?clim_id-value=8202251&f=json&limit=1&sortby=-date_tm-value`
  → `properties["date_tm-value"]`, `["air_temp-value"]`, `["pcpn_amt_pst24hrs-value"]` (may be null; use if present).
- Compute: `rain48 = sum(precip of last 2 complete days) + (swob pst24hrs if present and newer)`;
  `dryRunBefore = consecutive days with precip < 1 mm immediately before the last rain day`; `tmaxDry = max MAX_TEMPERATURE over that run`.
- Label (state as heuristic in UI): **elevated** if rain48 ≥ 15 and dryRunBefore ≥ 5 and tmaxDry ≥ 22; **watch** if rain48 ≥ 15 or (dryRunBefore ≥ 7 and tmaxDry ≥ 25); else **normal**.
- Return `{label, rain48, dryRunBefore, tmaxDry, lastCompleteDay, hourly:{time, airTemp}, station:"Halifax Stanfield (regional)", fetchedAt}`.
### `src/app/api/sightings/route.ts` (cache 30 min)
- Fetch `https://novascotia.ca/blue-green-algae/` with a User-Agent. Find the text "reported in 2026"; parse the first `<table>` after it into rows
  `{lake, community, county, when, type}`. If no table → `parsed:false, entries:[]`.
- Return `{checkedAt, parsed, entries}`. UI matches entries to a lake by case-insensitive inclusion of the lake name minus the word "Lake".

## Step 3 (13 min) — UI
### `MapView.tsx`
- Load lakes on mount; render a react-leaflet `GeoJSON`/`Polygon` per lake. Stroke: sky-700 = satellite within baseline; amber = unvalidated anomaly;
  slate dashed = no satellite series or not measurable. Fill 15 %. Add a filter chip "Lakes" (like the Events chip).
- Popup → `LakeCard` (fits 13.5 rem in compact mode), four rows, each with its own timestamp:
  1. **Bloom conditions** (weather, regional): `▲ Elevated / ● Watch / ✓ Normal` + one line "31 mm rain after 9 dry days" + "updated HH:MM, regional".
  2. **Reported sightings**: latest 2026 entry for this lake if any, else "none listed" + "list checked HH:MM"; plus `reports` history text (2023-25) in small type.
  3. **Official testing (HRM)**: "supervised beach" from `access` if it contains "supervised" else "not tested"; "season ended Aug 31".
  4. **Satellite**: if available: "within baseline" or "unvalidated anomaly", "last clear look <date> (N days ago)", clear looks last 30 d, 40-px inline SVG sparkline of `history`; if not measurable: "too small for satellite (N interior px)"; else "no series pulled yet".
- Footer line in the card: "Satellite index unvalidated. Not a safety rating."
### `PhoneApp.tsx`
- Above "Happening nearby", add a **Bloom conditions** strip fed by `/api/weather`: label, reason line, "Halifax region · updated HH:MM". Refresh every 10 min.
- Intro copy: append " Plus a daily watch on 40 lakes nobody tests."
- Keep beaches, events and Hugo untouched.

## Step 3b (2 min) — teammate link
External link "Which Tree Falls First ↗" → https://halifax-tree-screening.fly.dev/ (new tab, noopener): third entry in `Nav.tsx` LINKS (plain <a>) and a secondary pill under the landing headline in `page.tsx`. Link only; never embed or call it.

## Step 4 (5 min) — run and check
`npm run dev` → http://localhost:3000/#app. Check: strip shows a label with today's time; click Sandy Lake → four rows with timestamps;
Lake Echo shows last clear look Sep 11; Oat Hill shows "too small". Lint: `npm run lint`.

## Banned words in UI: current, real-time, safe, unsafe, toxic, bloom detected, pets, dogs.
## Next-steps slide (do not build): PlanetScope daily 3 m for true daily satellite; per-lake weather from nearest station; validation against HRM samples.

## Already answered — use verbatim, do not re-research (source: ../feasibility/VERDICT.md)
- ECCC works keyless; station Halifax Stanfield, CLIMATE_IDENTIFIER 8202251; daily rows lag 1-2 days; SWOB hourly is same-hour. Exact URLs are in Step 2.
- Satellite cadence: median 10 days between clear looks per lake, September 1-4 looks; last clear look for most lakes is 2026-08-30, Lake Echo 2026-09-11. Show "last clear look <date> (N days ago)". Never "current".
- Satellite rule and evidence text: "max(MCI,FAI) on Sentinel-2 L1C, lake median, 60 m buffer; flag = above lake baseline (median + 3 MAD, floor 0.002); unvalidated: backtest hit rate 3/28, false alarm 0.06". Copy `meta.rule` from lakes.json.
- Measurability: 641 of 1,363 named HRM lakes have >= 25 interior 20 m pixels; Oat Hill, Penhorn, Elbow do not (`measurable:false` in lakes.json).
- Sentinel-2 L2A is not used (negative reflectance in ~1/3 of observations); L1C values are what is in lakes.json. Do not compute anything from bands.
- Bloom trigger wording (province): "a period of hot, dry weather followed by heavy rainfall". Thresholds in Step 2 are our stated heuristic.
- Provincial list: month-level dates; type column exists from 2024 (Bloom / Benthic / Mat / Pelagic). 2026 list is on https://novascotia.ca/blue-green-algae/ under "reported in 2026".
- HRM supervised beaches test weekly, July 1 to Aug 31 only; season is over today (2026-09-12).
- Licences: OSM polygons ODbL (attribution "© OpenStreetMap contributors" in the map footer already covers it).
- Next steps slide only: PlanetScope daily 3 m; per-lake weather; validation against HRM samples.
If a question is not answered here or in VERDICT.md, make the simplest assumption, state it in the summary, and keep building.
