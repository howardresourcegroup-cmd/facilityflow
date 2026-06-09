import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export interface ParsedProperty {
  name: string;
  type: string;
  city: string;
  state: string;
  floors: number[];
  floorLabels: string[];
  notes: string;
}

const SYSTEM = `You are a hotel/property setup assistant. The user will describe a property in plain English.
Your job is to extract a structured configuration for setting up that property in a facilities management system.

Return ONLY valid JSON — no markdown, no explanation, just the JSON object.

Schema:
{
  "name": string,           // property name (infer from description if given, else "")
  "type": string,           // one of: hotel, lodge, resort, inn, other
  "city": string,           // city name if mentioned, else ""
  "state": string,          // 2-letter state code if mentioned, else ""
  "floors": number[],       // array of room counts per floor, index 0 = ground/first floor
  "floorLabels": string[],  // human label for each floor, e.g. "Ground Floor (Lobby)", "Floor 2"
  "notes": string           // short explanation of assumptions made
}

Rules:
- A floor with 0 rooms means it's public/common space (lobby, restaurant, pool, gym, etc.)
- If the user says "20 rooms on each of floors 2-5", that's floors: [0, 20, 20, 20, 20] (floor 1 = ground public)
- If no room counts are given, make a reasonable estimate for a typical property of that type and size
- Keep floorLabels concise (max 30 chars each)
- type must be exactly one of: hotel, lodge, resort, inn, other
- state must be a 2-letter US state code if a US state is mentioned, else ""`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured (ANTHROPIC_API_KEY missing)" }, { status: 503 });
  }

  const { description } = await req.json().catch(() => ({}));
  if (!description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM,
      messages: [{ role: "user", content: description.trim() }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed: ParsedProperty = JSON.parse(raw);

    // Basic sanity checks
    const validTypes = ["hotel", "lodge", "resort", "inn", "other"];
    if (!validTypes.includes(parsed.type)) parsed.type = "hotel";
    if (!Array.isArray(parsed.floors) || !parsed.floors.length) parsed.floors = [12, 12, 12];
    parsed.floors = parsed.floors.map((n) => Math.max(0, Math.min(200, Math.round(n))));
    if (!Array.isArray(parsed.floorLabels) || parsed.floorLabels.length !== parsed.floors.length) {
      parsed.floorLabels = parsed.floors.map((_, i) => `Floor ${i + 1}`);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("parse-property error:", err);
    return NextResponse.json({ error: "Failed to parse description" }, { status: 500 });
  }
}
