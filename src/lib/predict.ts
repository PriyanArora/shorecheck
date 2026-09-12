import type { Beach, Status } from "@/lib/data";

/** Predicted swim status from rain alone. Runoff after rain is the main driver of beach bacteria. */
export type Pred = "open" | "advisory" | "closed";

export const THRESHOLDS = {
  lake: { advisory: 10, closed: 25 },
  ocean: { advisory: 15, closed: 35 },
} as const;

export function predictStatus(water: "lake" | "ocean", rain48: number, tmax: number | null) {
  const t = THRESHOLDS[water];
  const status: Pred = rain48 >= t.closed ? "closed" : rain48 >= t.advisory ? "advisory" : "open";
  const score = Math.min(100, Math.round(rain48 * 3 + (tmax !== null && tmax >= 25 ? 10 : 0)));
  const why =
    status === "open"
      ? `${rain48} mm in 48 h is under the ${t.advisory} mm ${water} threshold`
      : status === "advisory"
        ? `${rain48} mm in 48 h is over the ${t.advisory} mm ${water} threshold`
        : `${rain48} mm in 48 h is over the ${t.closed} mm ${water} closure threshold`;
  return { status, score, why };
}

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/** "Sampled Sep 11, 9:05 AM" or "Last sampled Aug 31" → "2026-09-11". */
export function sampledDate(beach: Beach, year = new Date().getFullYear()): string | null {
  const m = beach.sampled.match(/([A-Z][a-z]{2}) (\d{1,2})/);
  if (!m || !MONTHS[m[1]]) return null;
  return `${year}-${MONTHS[m[1]]}-${m[2].padStart(2, "0")}`;
}

/** Only tested beaches can be scored. */
export function comparable(status: Status): status is Pred {
  return status !== "season";
}

export type DayPrediction = {
  date: string;
  precip: number;
  rain48: number;
  tmax: number | null;
  lake: Pred;
  ocean: Pred;
  samples: number; // official samples dated this day
  hits: number; // of those, how many the prediction matched
};

export type BeachComparison = {
  id: string;
  name: string;
  water: "lake" | "ocean";
  official: Status;
  officialResult: string;
  officialDate: string | null;
  predictedOnSampleDay: Pred | null;
  predictedNow: Pred;
  match: boolean | null;
};

export type PredictPayload = {
  fetchedAt: string;
  station: string;
  asOf: string | null;
  now: {
    rain48: number;
    tmax: number | null;
    lake: ReturnType<typeof predictStatus>;
    ocean: ReturnType<typeof predictStatus>;
  };
  days: DayPrediction[];
  beaches: BeachComparison[];
  accuracy: { n: number; hits: number; pct: number | null };
};
