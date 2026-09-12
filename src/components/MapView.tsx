"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { BEACHES, EVENTS, STATUS, type Beach, type SCEvent, type Status } from "@/lib/data";
import { LakeCard } from "@/components/LakeCard";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusMark, EventMark } from "@/components/StatusMark";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { loadLakes, type Lake, type SightingsPayload, type WeatherPayload } from "@/lib/lakes";
import { cn } from "@/lib/utils";

const TRI = "[clip-path:polygon(50%_0,100%_100%,0_100%)]";
const OCT =
  "[clip-path:polygon(30%_0,70%_0,100%_30%,100%_70%,70%_100%,30%_100%,0_70%,0_30%)]";

/** Marker glyphs: shape + icon + colour, so status never rides on colour alone. */
const MARKER_HTML: Record<Status, string> = {
  open: `<span class="flex size-7 items-center justify-center rounded-full border-2 border-black bg-emerald-400 font-mono text-xs font-bold text-black shadow-md">✓</span>`,
  advisory: `<span class="flex size-8 items-end justify-center bg-black ${TRI} drop-shadow-md"><span class="flex h-[26px] w-[26px] items-end justify-center pb-[3px] bg-amber-400 ${TRI} font-mono text-[11px] font-bold text-black">!</span></span>`,
  closed: `<span class="flex size-8 items-center justify-center bg-black ${OCT} drop-shadow-md"><span class="flex size-7 items-center justify-center bg-red-500 ${OCT} font-mono text-[11px] font-bold text-black">✕</span></span>`,
  season: `<span class="flex size-7 items-center justify-center rounded-[3px] border-2 border-black bg-neutral-500 font-mono text-xs font-bold text-black shadow-md">–</span>`,
};

const EVENT_HTML = `<span class="flex size-8 items-center justify-center"><span class="block size-5 rotate-45 rounded-[3px] border-2 border-black bg-white shadow-md"></span></span>`;
const LAKE_HTML = `<span class="block size-3 rounded-[2px] border border-white/80 bg-white/20"></span>`;

const icon = (html: string) =>
  L.divIcon({ html, className: "", iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -14] });

const ORDER: Status[] = ["open", "advisory", "closed", "season"];

/** Lake stroke: white = satellite within baseline, amber = unvalidated anomaly, dashed grey = no series. */
const lakeStyle = (lake: Lake): L.PathOptions => {
  const sat = lake.satellite;
  if (sat.available && lake.measurable) {
    const c = sat.flag ? "#fbbf24" : "#f5f5f7";
    return { color: c, weight: 2, fillColor: c, fillOpacity: 0.15 };
  }
  return { color: "#8e8e93", weight: 1.25, dashArray: "4 3", fillColor: "#8e8e93", fillOpacity: 0.12 };
};

const chip = (on: boolean) =>
  cn(
    "pointer-events-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium backdrop-blur-xl transition-[background-color,color] duration-200 ease-out",
    on
      ? "border-white/20 bg-white/15 text-white"
      : "border-white/10 bg-black/40 text-white/45 line-through",
  );

export default function MapView() {
  const [shown, setShown] = useState<Status[]>(ORDER);
  const [events, setEvents] = useState(true);
  const [open, setOpen] = useState<SCEvent | null>(null);
  const [lakesOn, setLakesOn] = useState(true);
  const [lakes, setLakes] = useState<Lake[]>([]);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [sightings, setSightings] = useState<SightingsPayload | null>(null);

  useEffect(() => {
    let alive = true;
    loadLakes().then((f) => alive && setLakes(f.lakes)).catch(() => {});
    fetch("/api/weather").then((r) => r.json()).then((j: WeatherPayload) => alive && setWeather(j)).catch(() => {});
    fetch("/api/sightings").then((r) => r.json()).then((j: SightingsPayload) => alive && setSightings(j)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (s: Status) =>
    setShown((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const beaches = BEACHES.filter((b) => shown.includes(b.status));

  return (
    <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-[#0a0a0a]">
      <MapContainer center={[44.68, -63.58]} zoom={10} zoomControl={false} scrollWheelZoom className="h-full w-full">
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {lakesOn &&
          lakes.map((lake) => (
            <GeoJSON key={lake.key} data={lake.geometry} style={lakeStyle(lake)}>
              <Popup>
                <LakeCard lake={lake} weather={weather} sightings={sightings} />
              </Popup>
            </GeoJSON>
          ))}

        {beaches.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
            icon={icon(MARKER_HTML[b.status])}
            title={`${b.name} — ${STATUS[b.status].label}`}
          >
            <Popup>
              <BeachCard beach={b} />
            </Popup>
          </Marker>
        ))}

        {events &&
          EVENTS.map((e) => (
            <Marker key={e.id} position={[e.lat, e.lng]} icon={icon(EVENT_HTML)} title={`Event — ${e.title}`}>
              <Popup>
                <div className="px-4 pt-3.5 pb-3">
                  <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-white/50 uppercase">
                    <EventMark size="size-2" /> Event
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-white">{e.title}</p>
                  <p className="font-mono text-[11px] text-white/45">
                    {e.when} · {e.time}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-white/70">{e.blurb}</p>
                  <Button
                    onClick={() => setOpen(e)}
                    className="mt-3 h-8 w-full rounded-full bg-white text-[12px] font-medium text-black hover:bg-white/90"
                  >
                    Full details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* filters */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1200 flex flex-wrap gap-1.5 p-3">
        {ORDER.map((s) => (
          <button key={s} onClick={() => toggle(s)} aria-pressed={shown.includes(s)} className={chip(shown.includes(s))}>
            <StatusMark status={s} size="size-3.5" text="text-[9px]" />
            {s === "season" ? "Season over" : STATUS[s].label}
          </button>
        ))}
        <button onClick={() => setEvents((v) => !v)} aria-pressed={events} className={chip(events)}>
          <EventMark size="size-2" />
          Events
        </button>
        <button onClick={() => setLakesOn((v) => !v)} aria-pressed={lakesOn} className={chip(lakesOn)}>
          <span dangerouslySetInnerHTML={{ __html: LAKE_HTML }} />
          Lakes
        </button>
      </div>

      {/* event panel */}
      {open && (
        <div className="absolute inset-y-0 right-0 z-1300 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#111]/95 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-white/50 uppercase">
              <EventMark size="size-2" /> Event
            </p>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(null)} aria-label="Close event details" className="-mt-1 text-white/60">
              ✕
            </Button>
          </div>
          <h3 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-white">{open.title}</h3>
          <p className="mt-1 font-mono text-[12px] text-white/45">{open.host}</p>
          <Separator className="my-4 bg-white/10" />
          <dl className="space-y-2 font-mono text-[12px]">
            {[
              ["When", `${open.when}, ${open.time}`],
              ["Where", open.near],
              ["Cost", open.price],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-14 shrink-0 text-white/40">{k}</dt>
                <dd className="text-white/85">{v}</dd>
              </div>
            ))}
          </dl>
          <Separator className="my-4 bg-white/10" />
          <p className="text-[14px] leading-relaxed text-white/75">{open.detail}</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/5 p-3 text-[12px] text-white/70">
            <span>Water at {open.near}</span>
            <StatusBadge status={BEACHES.find((b) => b.name === open.near)?.status ?? "open"} short />
          </div>
        </div>
      )}
    </div>
  );
}

function BeachCard({ beach }: { beach: Beach }) {
  return (
    <div className="px-4 pt-3.5 pb-3">
      <StatusBadge status={beach.status} />
      <p className="mt-2 text-[15px] font-semibold text-white">{beach.name}</p>
      <p className="font-mono text-[11px] text-white/45 capitalize">{beach.water} beach</p>
      <div className="mt-3 rounded-xl bg-white/5 px-3 py-2">
        <p className="font-mono text-[12px] font-semibold text-white">{beach.result}</p>
        <p className="font-mono text-[10px] text-white/45">{beach.sampled}</p>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-white/70">{beach.plain}</p>
    </div>
  );
}
