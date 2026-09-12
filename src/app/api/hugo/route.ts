import { BEACHES, EVENTS } from "@/lib/data";

/** Hugo, backed by Gemini. Grounded in the same beach and event data as the map. */
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

type Turn = { role: "user" | "model"; text: string };

const SYSTEM = `You are Hugo, a friendly local who helps people in Halifax, Nova Scotia pick a beach.
Today is ${new Date().toDateString()}. HRM's supervised-beach testing season ended Aug 31; the latest official sample is the ruling.

Rules:
- Answer ONLY from the data below. Never invent beaches, results, or events.
- Be short: two to four sentences, plain spoken, no bullet lists, no markdown.
- Always name the beach's status and the latest result when you recommend it.
- Never recommend a beach that is "closed". Warn clearly if a beach is on "advisory". Beaches with status "season" are unsupervised and untested.
- Mention a nearby event only if it is relevant.
- If the question is not about beaches, water, swimming, surfing, or events nearby, say what you can help with in one sentence.
- On the LAST line, if you recommended one specific beach, write exactly: BEACH: <id>. Otherwise write nothing extra.

BEACHES (id | name | water | status | result | sampled | vibe | note):
${BEACHES.map((b) => `${b.id} | ${b.name} | ${b.water} | ${b.status} | ${b.result} | ${b.sampled} | ${b.vibe} | ${b.plain}`).join("\n")}

EVENTS (title | host | when | time | near | price | blurb):
${EVENTS.map((e) => `${e.title} | ${e.host} | ${e.when} | ${e.time} | ${e.near} | ${e.price} | ${e.blurb}`).join("\n")}`;

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 503 });

  let turns: Turn[] = [];
  try {
    const body = (await req.json()) as { messages?: Turn[] };
    turns = (body.messages ?? []).filter((t) => t.text?.trim()).slice(-12);
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (!turns.length) return Response.json({ error: "empty" }, { status: 400 });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text();
      return Response.json({ error: `gemini ${res.status}`, detail: detail.slice(0, 300) }, { status: 502 });
    }
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
    const m = raw.match(/\n?\s*BEACH:\s*([a-z0-9-]+)\s*$/i);
    const beachId = m && BEACHES.some((b) => b.id === m[1]) ? m[1] : null;
    const text = (m ? raw.slice(0, m.index) : raw).trim();
    return Response.json({ text, beachId, model: MODEL });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "failed" }, { status: 502 });
  }
}
