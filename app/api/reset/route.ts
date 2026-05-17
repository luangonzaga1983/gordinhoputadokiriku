import { NextRequest, NextResponse } from "next/server";
import { getGameState, setGameState, clearGameChannel } from "@/lib/discord";
import type { GameData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { hostId } = await req.json();
  const result = await getGameState();
  if (!result) return NextResponse.json({ error: "No game" }, { status: 404 });

  const game: GameData = result.data;
  if (game.hostId !== hostId) return NextResponse.json({ error: "Not host" }, { status: 403 });

  await clearGameChannel();
  return NextResponse.json({ ok: true });
}
