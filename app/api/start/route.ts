import { NextRequest, NextResponse } from "next/server";
import { getPlayers, getGameState, setGameState, clearGameChannel } from "@/lib/discord";
import { randomCard } from "@/lib/cards";
import type { GameData } from "@/lib/types";

function genCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: NextRequest) {
  const { hostId, roomCode } = await req.json();
  const players = await getPlayers();

  if (players.length < 3) return NextResponse.json({ error: "Precisa de pelo menos 3 jogadores" }, { status: 400 });

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
    roomCode: roomCode || genCode(),
    createdAt: Date.now(),
  };

  await setGameState(gameData);
  return NextResponse.json({ ok: true, roomCode: gameData.roomCode });
}
