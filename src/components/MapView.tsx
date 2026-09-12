"use client";

import { useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import {
  BEACHES,
  EVENTS,
  STATUS,
  type Beach,
  type SCEvent,
  type Status,
} from "@/lib/data";
import { StatusChip, StatusMark, EventMark } from "@/components/StatusMark";

const TRI = "[clip-path:polygon(50%_0,100%_100%,0_100%)]";
const OCT =
  "[clip-path:polygon(30%_0,70%_0,100%_30%,100%_70%,70%_100%,30%_100%,0_70%,0_30%)]";

/** Marker glyphs: shape + icon + colour, so status never rides on colour alone. */
const MARKER_HTML: Record<Status, string> = {
  open: `<span class="flex size-7 items-center justify-center rounded-full border-2 border-white bg-emerald-600 font-mono text-xs font-bold text-white shadow-md">✓</span>`,
  advisory: `<span class="flex size-8 items-end justify-center bg-white ${TRI} drop-shadow-md"><span class="flex h-[26px] w-[26px] items-end justify-center pb-[3px] bg-amber-500 ${TRI} font-mono text-[11px] font-bold text-white">!</span></span>`,
  closed: `<span class="flex size-8 items-center justify-center bg-white ${OCT} drop-shadow-md"><span class="flex size-7 items-center justify-center bg-red-600 ${OCT} font-mono text-[11px] font-bold text-white">✕</span></span>`,
  season: `<span class="flex size-7 items-center justify-center rounded-[3px] border-2 border-white bg-slate-500 font-mono text-xs font-bold text-white shadow-md">–</span>`,
};

const EVENT_HTML = `<span class="flex size-8 items-center justify-center"><span class="block size-5 rotate-45 rounded-[3px] border-2 border-white bg-violet-600 shadow-md"></span></span>`;

const icon = (html: string) =>
  L.divIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });

const ORDER: Status[] = ["open", "advisory", "closed", "season"];

export default function MapView({ compact = false }: { compact?: boolean }) {
  const [shown, setShown] = useState<Status[]>(ORDER);
  const [events, setEvents] = useState(true);
  const [open, setOpen] = useState<SCEvent | null>(null);

  const toggle = (s: Status) =>
    setShown((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const beaches = BEACHES.filter((b) => shown.includes(b.status));

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-100 ${
        compact
          ? "compact-map h-full"
          : "h-[68vh] min-h-[420px] rounded-2xl border border-slate-200"
      }`}
    >
      <MapContainer
        center={[44.68, -63.58]}
        zoom={compact ? 9 : 10}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <ZoomControl position={compact ? "bottomright" : "topleft"} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
            <Marker
              key={e.id}
              position={[e.lat, e.lng]}
              icon={icon(EVENT_HTML)}
              title={`Event — ${e.title}`}
            >
              <Popup>
                <div className="p-3.5">
                  <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-violet-700 uppercase">
                    <EventMark size="size-2.5" /> Event
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-900">
                    {e.title}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {e.when} · {e.time}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-slate-600">
                    {e.blurb}
                  </p>
                  <button
                    onClick={() => setOpen(e)}
                    className="mt-2.5 w-full rounded-full bg-sky-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    Full details ↗
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* filters, floating */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-1200 flex gap-1.5 ${
          compact
            ? "gap-1 overflow-x-auto p-1.5 [scrollbar-width:none]"
            : "flex-wrap p-3"
        }`}
      >
        {ORDER.map((s) => {
          const on = shown.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              aria-pressed={on}
              className={`pointer-events-auto inline-flex shrink-0 items-center rounded-full font-semibold shadow-sm backdrop-blur ${
                compact ? "gap-1 px-2 py-1 text-[10px]" : "gap-1.5 px-2.5 py-1.5 text-[11px]"
              } ${
                on
                  ? "bg-white/90 text-slate-800 ring-1 ring-white"
                  : "bg-white/50 text-slate-400 line-through ring-1 ring-white/60"
              }`}
            >
              <StatusMark status={s} size="size-3.5" text="text-[9px]" />
              {compact && s === "season" ? "Season" : STATUS[s].label}
            </button>
          );
        })}
        <button
          onClick={() => setEvents((v) => !v)}
          aria-pressed={events}
          className={`pointer-events-auto inline-flex shrink-0 items-center rounded-full font-semibold shadow-sm backdrop-blur ${
            compact ? "gap-1 px-2 py-1 text-[10px]" : "gap-1.5 px-2.5 py-1.5 text-[11px]"
          } ${
            events
              ? "bg-white/90 text-slate-800 ring-1 ring-white"
              : "bg-white/50 text-slate-400 line-through ring-1 ring-white/60"
          }`}
        >
          <EventMark size="size-2.5" />
          Events
        </button>
      </div>

      {/* event panel */}
      {open && (
        <div
          className={`absolute inset-x-0 bottom-0 z-1300 max-h-[85%] overflow-y-auto border-t border-slate-200 bg-white shadow-2xl ${
            compact
              ? "rounded-t-[22px] p-4"
              : "p-5 sm:inset-y-0 sm:left-auto sm:max-h-none sm:w-96 sm:border-t-0 sm:border-l"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] text-violet-700 uppercase">
              <EventMark size="size-2.5" /> Event
            </p>
            <button
              onClick={() => setOpen(null)}
              className="-mt-1 rounded-full px-2 py-1 font-mono text-sm text-slate-500 hover:bg-slate-100"
              aria-label="Close event details"
            >
              ✕
            </button>
          </div>
          <h3 className="mt-2 text-xl leading-tight font-semibold">
            {open.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{open.host}</p>
          <dl className="mt-4 space-y-2 border-y border-slate-200 py-3 font-mono text-xs">
            {[
              ["When", `${open.when}, ${open.time}`],
              ["Where", open.near],
              ["Cost", open.price],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-14 shrink-0 text-slate-400">{k}</dt>
                <dd className="text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">
            {open.detail}
          </p>
          <p className="mt-4 rounded-xl bg-[#f4ecdd] p-3 text-xs leading-snug text-slate-700">
            Water status at {open.near}:{" "}
            {STATUS[BEACHES.find((b) => b.name === open.near)?.status ?? "open"]
              .label}
          </p>
        </div>
      )}

      {/* legend */}
      <div
        className={`absolute bottom-6 left-3 z-1200 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm ${
          compact ? "hidden" : "hidden sm:block"
        }`}
      >
        <p className="font-mono text-[10px] font-bold tracking-wide text-slate-400 uppercase">
          Legend
        </p>
        <ul className="mt-2 space-y-1.5">
          {ORDER.map((s) => (
            <li key={s} className="flex items-center gap-2 font-mono text-[11px]">
              <StatusMark status={s} size="size-3.5" text="text-[9px]" />
              {STATUS[s].label}
            </li>
          ))}
          <li className="flex items-center gap-2 font-mono text-[11px]">
            <EventMark size="size-2.5" />
            Event
          </li>
        </ul>
      </div>
    </div>
  );
}

function BeachCard({ beach }: { beach: Beach }) {
  return (
    <div className="p-3.5">
      <StatusChip status={beach.status} />
      <p className="mt-2 text-sm font-semibold text-slate-900">{beach.name}</p>
      <p className="font-mono text-[11px] text-slate-500 capitalize">
        {beach.water} beach
      </p>
      <div className="mt-2.5 rounded-xl bg-[#f4ecdd] px-2.5 py-2">
        <p className="font-mono text-[12px] font-bold text-slate-800">
          {beach.result}
        </p>
        <p className="font-mono text-[10px] text-slate-500">{beach.sampled}</p>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-slate-600">
        {beach.plain}
      </p>
    </div>
  );
}
