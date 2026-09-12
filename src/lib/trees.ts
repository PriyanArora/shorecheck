/** Satellite tree-canopy health for HRM's large green spaces: NDVI now versus the same weeks in prior years. */

export type Park = { key: string; name: string; area: string; geometry: GeoJSON.Polygon };

const box = (w: number, s: number, e: number, n: number): GeoJSON.Polygon => ({
  type: "Polygon",
  coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]],
});

/** Rough rectangles over the canopy. Only vegetated pixels (SCL 4) are counted, so water and roads inside drop out. */
export const PARKS: Park[] = [
  { key: "point_pleasant", name: "Point Pleasant Park", area: "Halifax south end", geometry: box(-63.578, 44.617, -63.56, 44.632) },
  { key: "dingle", name: "Sir Sandford Fleming Park", area: "Dingle, Northwest Arm", geometry: box(-63.618, 44.625, -63.605, 44.636) },
  { key: "hemlock", name: "Hemlock Ravine Park", area: "Bedford", geometry: box(-63.66, 44.683, -63.64, 44.697) },
  { key: "shubie", name: "Shubie Park", area: "Dartmouth", geometry: box(-63.552, 44.708, -63.538, 44.72) },
  { key: "long_lake", name: "Long Lake Provincial Park", area: "Spryfield side", geometry: box(-63.66, 44.615, -63.64, 44.632) },
  { key: "common", name: "Halifax Common", area: "Peninsula centre", geometry: box(-63.594, 44.646, -63.584, 44.652) },
  { key: "needham", name: "Fort Needham Memorial Park", area: "North end", geometry: box(-63.602, 44.66, -63.594, 44.665) },
];

export type CanopyLabel = "greener" | "typical" | "below" | "stressed";

export const LABEL_TEXT: Record<CanopyLabel, string> = {
  greener: "Greener than usual",
  typical: "Typical canopy",
  below: "Below its usual green",
  stressed: "Canopy stress signal",
};

export type Look = { date: string; ndvi: number; validPx: number };

export type ParkHealth = {
  key: string;
  name: string;
  area: string;
  window: { from: string; to: string };
  looks: Look[]; // clear looks in the current window, oldest first
  ndviNow: number | null; // median of clear looks in the window
  baseline: number | null; // median of the same calendar window in prior years
  baselineYears: number[];
  baselineLooks: number;
  anomaly: number | null; // (now - baseline) / |baseline|
  label: CanopyLabel | null;
  lastClearDate: string | null;
  error?: string;
};

export type TreeHealthPayload = {
  fetchedAt: string;
  source: string;
  parks: ParkHealth[];
  rule: string;
};

export function labelFor(anomaly: number | null): CanopyLabel | null {
  if (anomaly === null) return null;
  if (anomaly >= 0.05) return "greener";
  if (anomaly >= -0.05) return "typical";
  if (anomaly >= -0.15) return "below";
  return "stressed";
}

export const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
