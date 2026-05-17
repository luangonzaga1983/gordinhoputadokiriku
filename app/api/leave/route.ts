import { NextRequest, NextResponse } from "next/server";
import { getPlayers, setPlayers } from "@/lib/discord";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const players = await getPlayers();
  await setPlayers(players.filter(p => p.id !== id));
  return NextResponse.json({ ok: true });
}
