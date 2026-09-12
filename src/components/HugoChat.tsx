"use client";

import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { BEACHES, type Beach } from "@/lib/data";

type Msg = { id: number; from: "hugo" | "me"; text: string; beach?: Beach };

/** Hardcoded starters; each one is answered by Gemini with the live beach data. */
const SUGGESTIONS = [
  "Somewhere peaceful",
  "Somewhere happening",
  "Best beach for kids today?",
  "Where can I surf this weekend?",
  "Which beaches are closed and why?",
  "Closest clean beach to downtown?",
  "What's on near the beaches this weekend?",
  "Warmest ocean swim near the city?",
];

const OPENER: Msg = {
  id: 0,
  from: "hugo",
  text: "Hey, I'm Hugo. I'll find you a beach that's actually safe to swim at today. First things first — are you after somewhere peaceful, or somewhere happening?",
};

export function HugoChat({ compact = false }: { compact?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([OPENER]);
  const [draft, setDraft] = useState("");
  const [chips, setChips] = useState(true);
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const seq = useRef(1);
  const nextId = () => ++seq.current;

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    setChips(false);
    setDraft("");
    const history = [...msgs, { id: nextId(), from: "me" as const, text }];
    setMsgs(history);
    setTyping(true);
    try {
      const r = await fetch("/api/hugo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== 0)
            .map((m) => ({ role: m.from === "me" ? "user" : "model", text: m.text })),
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { text: string; beachId: string | null };
      if (!j.text) throw new Error("empty");
      const id = nextId();
      setMsgs((m) => [
        ...m,
        {
          id,
          from: "hugo",
          text: j.text,
          beach: j.beachId ? BEACHES.find((b) => b.id === j.beachId) : undefined,
        },
      ]);
    } catch (e) {
      const why = e instanceof Error ? e.message : "unknown";
      setMsgs((m) => [
        ...m,
        {
          id: nextId(),
          from: "hugo",
          text:
            why === "503"
              ? "Gemini isn't configured on this server yet. Add GEMINI_API_KEY and try again."
              : "I couldn't reach Gemini just now. Give it a second and send that again.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const body = compact ? "text-[13px]" : "text-[15px]";
  const avatar = compact ? "size-6 text-[10px]" : "size-8 text-xs";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {msgs.map((m) =>
          m.from === "hugo" ? (
            <div key={m.id} className="flex gap-2">
              <span
                className={`mt-0.5 grid shrink-0 place-items-center rounded-full bg-white font-bold text-black ${avatar}`}
              >
                H
              </span>
              <div className="max-w-[85%]">
                <p className="text-[10px] font-semibold text-[#86868b]">Hugo</p>
                <div
                  className={`mt-1 rounded-2xl rounded-tl-sm bg-[#1d1d1f] px-3 py-2 leading-snug text-[#f5f5f7] ring-1 ring-white/10 ${body}`}
                >
                  {m.text}
                </div>
                {m.beach && (
                  <div className="mt-2 rounded-2xl bg-[#1d1d1f] p-2.5 ring-1 ring-white/10">
                    <StatusBadge status={m.beach.status} short />
                    <p className="mt-1.5 text-[13px] font-bold">
                      {m.beach.name}
                    </p>
                    <p className="tabular-nums text-[10px] text-[#86868b]">
                      {m.beach.result}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-[#d2d2d7]">
                      {m.beach.plain}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div
                className={`max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-3 py-2 leading-snug text-black ${body}`}
              >
                {m.text}
              </div>
            </div>
          ),
        )}

        {chips && (
          <div className="flex flex-wrap gap-2 pl-8">
            {SUGGESTIONS.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/15 hover:bg-white/20"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {typing && (
          <p className="pl-8 text-[11px] text-[#86868b]">Hugo is typing…</p>
        )}
        <div ref={end} />
      </div>

      {!chips && (
        <div className="flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {SUGGESTIONS.slice(2).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              disabled={typing}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80 ring-1 ring-white/10 hover:bg-white/20 disabled:opacity-40"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className={`flex gap-2 border-t border-white/10 bg-black/80 px-3 pt-2.5 backdrop-blur ${compact ? "pb-5" : "pb-3"}`}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Hugo about a beach…"
          aria-label="Message Hugo"
          className={`min-w-0 flex-1 rounded-full bg-[#1d1d1f] px-3 py-2 text-white ring-1 ring-white/10 outline-none placeholder:text-[#86868b] focus:ring-white/40 ${body}`}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-white/90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
