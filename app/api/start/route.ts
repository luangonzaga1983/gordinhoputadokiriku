import { NextRequest, NextResponse } from "next/server";
import { getPlayers, getGameState, setGameState, clearGameChannel } from "@/lib/discord";
import { randomCard } from "@/lib/cards";
import type { GameData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { hostId } = await req.json();
  const players = await getPlayers();

  if (players.length < 3) {
    return NextResponse.json({ error: "Need at least 3 players" }, { status: 400 });
  }

  const card = randomCard();
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const impostorId = shuffled[0].id;
  const turnOrder = shuffled.map(p => p.id);

  const existing = await getGameState();
  if (existing) await clearGameChannel();

  const gameData: GameData = {
    state: "playing",
    players,
    card,
    impostorId,
    currentTurn: 0,
    turnOrder,
    hostId,
    createdAt: Date.now(),
  };

  await setGameState(gameData);
  return NextResponse.json({ ok: true });
}
