import { NextRequest, NextResponse } from "next/server";
import { getPlayers, setPlayers } from "@/lib/discord";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const players = await getPlayers();
  const id = crypto.randomUUID();
  const trimmed = name.trim().slice(0, 20);

  if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return NextResponse.json({ error: "Name taken" }, { status: 409 });
  }

  players.push({ id, name: trimmed });
  await setPlayers(players);

  return NextResponse.json({ id, name: trimmed });
}
