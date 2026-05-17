export type Player = {
  id: string;
  name: string;
  isImpostor?: boolean;
};

export type GameState = "lobby" | "playing" | "voting" | "ended";

export type GameData = {
  state: GameState;
  players: Player[];
  card: { id: number; name: string; rarity: string; type: string } | null;
  impostorId: string | null;
  currentTurn: number;
  turnOrder: string[];
  hostId: string;
  createdAt: number;
};
