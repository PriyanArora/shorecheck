# ShoreCheck

Halifax beach water, told honestly. Lab results, a rain model that grades itself, a satellite eye on 43 lakes nobody tests, and Hugo to pick your beach.

Every signal moves at its own speed, so every number on screen carries the time it was taken. A lab sample is a weekly ruling. Weather is hourly. A satellite gets a clear look about every ten days. A bloom can surface in two. We never blend those into one "safe" word, because that word would be a lie.

## What's inside

**Beaches.** The latest HRM sample at 12 supervised beaches, on a monochrome Leaflet map. Status is shape, colour and a word, never colour alone.

**Predict.** Rain over the last 48 hours at Halifax Stanfield, thresholded per water type. Then the model is replayed on the day each beach was sampled and scored against the lab. Right now it's wrong more often than right, and the page says so.

**Lake watch.** Sentinel-2 L1C, `max(MCI, FAI)`, lake median inside a 60 m buffer, flagged against each lake's own baseline (median + 3 MAD). Eight lakes have a series; the rest are outlines with their reported-sighting history. Each card shows the last clear look, days since, clear looks in 30 days, a sparkline, and whether the province's bloom trigger (four warm dry days, then 15 mm) has fired since that look.

**Hugo.** Gemini, fed only the beach and event tables, told to name the status every time.

**Trees.** The same satellite, pointed at the canopy. Sentinel-2 L2A NDVI over seven HRM parks, vegetated pixels only, median of the last 45 days against the same weeks in the two prior summers. A park much less green than its own past is a stress signal, dated like everything else.

## Architecture

```mermaid
flowchart TB
  subgraph client["Client · React 19, Tailwind 4, shadcn/ui, react-leaflet"]
    dash["/dashboard"]
    pred["/predict"]
    hugo["/hugo"]
    trees["/trees"]
  end

  subgraph server["Server · Next.js 16 App Router"]
    direction LR
    subgraph api["Route handlers · in-memory cache"]
      weather["api/weather"]
      predict["api/predict"]
      sightings["api/sightings"]
      hugoapi["api/hugo"]
    end
    subgraph lib["src/lib · pure functions"]
      weatherlib["weather.ts"]
      predictlib["predict.ts"]
      lakeslib["lakes.ts"]
      data["data.ts"]
    end
    lakesjson[("public/data/lakes.json")]
  end

  subgraph ext["External"]
    eccc["ECCC GeoMet"]
    ns["novascotia.ca"]
    gemini["Gemini API"]
    osm["OpenStreetMap tiles"]
    tree["halifax-tree-screening.fly.dev"]
  end

  dash --> weather & sightings & lakesjson
  dash --> osm
  pred --> predict
  hugo --> hugoapi
  trees -. iframe .-> tree

  weather --> weatherlib --> eccc
  predict --> weatherlib & predictlib & data
  sightings --> ns
  hugoapi --> data & gemini
  dash --> lakeslib
```

Route handlers are plain `GET`/`POST` functions with a module-level cache. Logic in `src/lib` is pure and shared by server and client. The satellite pull ran once, offline, and ships as static JSON. Only Gemini needs a key.

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
