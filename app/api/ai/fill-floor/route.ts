import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

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
- "name" should be the room identifier (e.g. "Room 101", "Suite 2A", "Maintenance Closet", "Housekeeping Storage")
- "type" must be one of the valid types above
- If a range is given (e.g. "rooms 201-218"), expand it into individual entries
- Keep names concise — max 20 characters
- Return a flat array, no nesting`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }
  const { description } = await req.json().catch(() => ({}));
  if (!description?.trim()) {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: description.trim() }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const rooms: ParsedRoom[] = JSON.parse(raw);

    const sanitized = rooms
      .filter(r => r.name?.trim())
      .map(r => ({
        name: String(r.name).trim().slice(0, 30),
        type: VALID_TYPES.includes(r.type) ? r.type : "guest_room",
      }));

    return NextResponse.json({ rooms: sanitized });
  } catch (err) {
    console.error("fill-floor error:", err);
    return NextResponse.json({ error: "Failed to parse description" }, { status: 500 });
  }
}
