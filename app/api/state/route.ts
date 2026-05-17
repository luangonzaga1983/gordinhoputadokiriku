import { NextResponse } from "next/server";
import { getGameState, getPlayers } from "@/lib/discord";

export async function GET() {
  const [stateResult, players] = await Promise.all([getGameState(), getPlayers()]);
  return NextResponse.json({
    game: stateResult?.data ?? null,
    messageId: stateResult?.messageId ?? null,
    players,
  });
}
