import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export interface ParsedRoom {
  name: string;
  type: string;
}

const VALID_TYPES = [
  "guest_room","suite","cabin","lobby","office","restaurant","kitchen",
  "bar","conference","restroom","housekeeping","maintenance","mechanical",
  "pool","spa","fitness","storage","utility","hallway","elevator","other",
];

const SYSTEM = `You are a hotel floor plan assistant. The user will describe what rooms are on a floor.
Return ONLY a JSON array of room objects — no markdown, no explanation.

Schema: [{ "name": string, "type": string }, ...]

Valid types: guest_room, suite, cabin, lobby, office, restaurant, kitchen, bar, conference, restroom, housekeeping, maintenance, mechanical, pool, spa, fitness, storage, utility, hallway, elevator, other

Rules:
- name should be the room identifier (e.g. "Room 101", "Suite 2A", "Maintenance Closet")
- type must be one of the valid types above
- If a range is given (e.g. "rooms 201-218"), expand into individual entries
- Keep names concise — max 20 characters
- Return a flat array, no nesting`;

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const { description } = await req.json().catch(() => ({}));
  if (!description?.trim()) return NextResponse.json({ error: "description required" }, { status: 400 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: description.trim() }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "AI request failed" }, { status: 502 });

  try {
    const data = await res.json();
    let raw = data.content[0].text.trim();
    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const rooms: ParsedRoom[] = JSON.parse(raw);
    const sanitized = rooms
      .filter((r: ParsedRoom) => r.name?.trim())
      .map((r: ParsedRoom) => ({
        name: String(r.name).trim().slice(0, 30),
        type: VALID_TYPES.includes(r.type) ? r.type : "guest_room",
      }));
    return NextResponse.json({ rooms: sanitized });
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
