import { NextRequest, NextResponse } from "next/server";
import { getGameState, setGameState } from "@/lib/discord";
import type { GameData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { playerId } = await req.json();
  const result = await getGameState();
  if (!result) return NextResponse.json({ error: "No game" }, { status: 404 });

  const game: GameData = result.data;
  const currentPlayerId = game.turnOrder[game.currentTurn];

  if (currentPlayerId !== playerId) {
    return NextResponse.json({ error: "Not your turn" }, { status: 403 });
  }

  const nextTurn = game.currentTurn + 1;
  const updatedGame: GameData = {
    ...game,
    currentTurn: nextTurn >= game.turnOrder.length ? 0 : nextTurn,
    state: nextTurn >= game.turnOrder.length ? "voting" : "playing",
  };

  await setGameState(updatedGame, result.messageId);
  return NextResponse.json({ ok: true });
}
