# ShoreCheck

Halifax beach water, told honestly. Lab results, a rain model that grades itself, a satellite eye on 43 lakes nobody tests, and Hugo to pick your beach.

Every signal moves at its own speed, so every number on screen carries the time it was taken. A lab sample is a weekly ruling. Weather is hourly. A satellite gets a clear look about every ten days. A bloom can surface in two. We never blend those into one "safe" word, because that word would be a lie.

## What's inside

**Beaches.** The latest HRM sample at 12 supervised beaches, on a monochrome Leaflet map. Status is shape, colour and a word, never colour alone.

**Predict.** Rain over the last 48 hours at Halifax Stanfield, thresholded per water type. Then the model is replayed on the day each beach was sampled and scored against the lab. Right now it's wrong more often than right, and the page says so.

**Lake watch.** Sentinel-2 L1C, `max(MCI, FAI)`, lake median inside a 60 m buffer, flagged against each lake's own baseline (median + 3 MAD). Eight lakes have a series; the rest are outlines with their reported-sighting history. Each card shows the last clear look, days since, clear looks in 30 days, a sparkline, and whether the province's bloom trigger (four warm dry days, then 15 mm) has fired since that look.

**Hugo.** Gemini, fed only the beach and event tables, told to name the status every time.

## Architecture

```mermaid
flowchart LR
  UI[Next.js 16 · React 19 · Tailwind 4 · shadcn · react-leaflet] --> W[/api/weather]
  UI --> P[/api/predict]
  UI --> S[/api/sightings]
  UI --> H[/api/hugo]
  UI --> J[(lakes.json · 43 polygons · 8 index series)]
  W & P --> ECCC[ECCC GeoMet · station 8202251]
  S --> NS[novascotia.ca algae list]
  H --> G[Gemini]
```

Route handlers are plain `GET`/`POST` functions with a module-level cache. Pure logic sits in `src/lib`. The satellite pull happened once, offline, and ships as static JSON. Only Gemini needs a key.

## What the math says

We tried to turn the weather trigger into a probability. It doesn't survive contact with data. Across 647 clear looks from 2021 to 2026, looks within ten days of a trigger were above baseline 8.7% of the time; all other looks, 8.0%. Relative risk 1.09, p = 0.49. So the badge is context about how stale a satellite look is, not a forecast. The satellite index itself backtests at 3 hits in 28. The UI calls it unvalidated on every card.

## Run it

```bash
npm install
echo "GEMINI_API_KEY=..." > .env.local
npm run dev
```

Deploy to Vercel, set the same variable, done.

## Licences

Code is MIT. Sentinel-2 imagery is Copernicus, free and open, contains modified Copernicus Sentinel data 2021 to 2026. Weather is Environment and Climate Change Canada under the Open Government Licence – Canada. Lake polygons are © OpenStreetMap contributors, ODbL. Beach results and bloom reports are reproduced from HRM and Nova Scotia Environment as published.

Built by Priyan Arora and Aaryan Kapoor at a Halifax hackathon.
