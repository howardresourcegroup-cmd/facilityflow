import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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
  "name": string,
  "type": string,
  "city": string,
  "state": string,
  "floors": number[],
  "floorLabels": string[],
  "notes": string
}

Rules:
- type must be exactly one of: hotel, lodge, resort, inn, other
- floors is an array of room counts per floor (0 = common/public space)
- floorLabels must have same length as floors
- state is 2-letter US code or ""`;

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
      max_tokens: 512,
      system: SYSTEM,
      messages: [{ role: "user", content: description.trim() }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "AI request failed" }, { status: 502 });

  try {
    const data = await res.json();
    const raw = data.content[0].text.trim();
    const parsed: ParsedProperty = JSON.parse(raw);

    const validTypes = ["hotel","lodge","resort","inn","other"];
    if (!validTypes.includes(parsed.type)) parsed.type = "hotel";
    if (!Array.isArray(parsed.floors) || !parsed.floors.length) parsed.floors = [12,12,12];
    parsed.floors = parsed.floors.map((n: number) => Math.max(0, Math.min(200, Math.round(n))));
    if (!Array.isArray(parsed.floorLabels) || parsed.floorLabels.length !== parsed.floors.length) {
      parsed.floorLabels = parsed.floors.map((_: number, i: number) => `Floor ${i+1}`);
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
