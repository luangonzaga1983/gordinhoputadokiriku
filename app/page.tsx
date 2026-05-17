"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { GameData } from "@/lib/types";

type Me = { id: string; name: string };
type StateResponse = { game: GameData | null; players: { id: string; name: string }[] };

const RARITY_COLOR: Record<string, string> = {
  Common: "#9ca3af",
  Rare: "#3a86ff",
  Epic: "#a855f7",
  Legendary: "#f5c842",
  Champion: "#e63946",
};

export default function Home() {
  const [me, setMe] = useState<Me | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StateResponse>({ game: null, players: [] });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      const json = await res.json();
      setData(json);
    } catch {}
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("impostor_me");
    if (saved) setMe(JSON.parse(saved));
    fetchState();
    pollRef.current = setInterval(fetchState, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchState]);

  const join = async () => {
    if (!nameInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setMe(json);
      localStorage.setItem("impostor_me", JSON.stringify(json));
      await fetchState();
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  };

  const leave = async () => {
    if (!me) return;
    await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: me.id }),
    });
    localStorage.removeItem("impostor_me");
    setMe(null);
    await fetchState();
  };

  const startGame = async () => {
    if (!me) return;
    setLoading(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: me.id }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error);
      else await fetchState();
    } finally { setLoading(false); }
  };

  const nextTurn = async () => {
    if (!me) return;
    setLoading(true);
    try {
      await fetch("/api/next-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: me.id }),
      });
      await fetchState();
    } finally { setLoading(false); }
  };

  const resetGame = async () => {
    if (!me) return;
    setLoading(true);
    try {
      await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: me.id }),
      });
      await fetchState();
    } finally { setLoading(false); }
  };

  const { game, players } = data;
  const isHost = me && (!game || game.hostId === me.id || !game.hostId);
  const amIPlaying = me && game?.players.some(p => p.id === me.id);
  const myTurnId = game?.turnOrder[game.currentTurn];
  const isMyTurn = me && myTurnId === me.id;
  const amImpostor = me && game?.impostorId === me.id;
  const currentPlayerName = game?.players.find(p => p.id === myTurnId)?.name;
  const alreadyInLobby = me && players.some(p => p.id === me.id);

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fade-in w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display text-7xl tracking-widest" style={{ color: "var(--gold)" }}>
              IMPOSTOR
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Clash Royale Edition
            </p>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Seu nome
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="Digite seu nome..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && join()}
              className="w-full rounded-xl px-4 py-3 text-base outline-none border transition-colors"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            {error && <p className="text-sm mt-2" style={{ color: "var(--red)" }}>{error}</p>}
            <button
              onClick={join}
              disabled={loading || !nameInput.trim()}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all disabled:opacity-40"
              style={{ background: "var(--gold)", color: "#0a0b0f" }}
            >
              {loading ? "Entrando..." : "Entrar no lobby"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game || game.state === "ended") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="fade-in w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="font-display text-6xl tracking-widest" style={{ color: "var(--gold)" }}>IMPOSTOR</h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Clash Royale Edition</p>
          </div>

          <div className="rounded-2xl p-6 border mb-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Lobby
              </h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--bg)", color: "var(--muted)" }}>
                {players.length}/∞
              </span>
            </div>

            {players.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>Nenhum jogador ainda</p>
            ) : (
              <ul className="space-y-2">
                {players.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "var(--bg)" }}>
                    <span className="text-xs w-5 text-center" style={{ color: "var(--muted)" }}>{i + 1}</span>
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    {p.id === me.id && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,200,66,0.15)", color: "var(--gold)" }}>você</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {players.length < 3 && (
            <p className="text-center text-sm mb-4" style={{ color: "var(--muted)" }}>
              Aguardando {3 - players.length} jogador{3 - players.length !== 1 ? "es" : ""} para iniciar...
            </p>
          )}

          <div className="space-y-2">
            {alreadyInLobby && isHost && players.length >= 3 && (
              <button
                onClick={startGame}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all disabled:opacity-40"
                style={{ background: "var(--gold)", color: "#0a0b0f" }}
              >
                {loading ? "Iniciando..." : "⚔️ Iniciar Partida"}
              </button>
            )}
            <button
              onClick={leave}
              className="w-full py-3 rounded-xl text-sm border transition-all"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              Sair do lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (game.state === "playing" || game.state === "voting") {
    if (!amIPlaying) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center fade-in">
            <p style={{ color: "var(--muted)" }}>Você não está nesta partida.</p>
            <button onClick={leave} className="mt-4 text-sm underline" style={{ color: "var(--muted)" }}>Voltar</button>
          </div>
        </div>
      );
    }

    const card = game.card;
    const rarityColor = card ? RARITY_COLOR[card.rarity] ?? "var(--text)" : "var(--text)";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="fade-in w-full max-w-sm space-y-4">

          {game.state === "voting" ? (
            <div
              className="rounded-2xl p-8 text-center border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="text-5xl mb-4">🗳️</div>
              <h2 className="font-display text-4xl tracking-wider mb-2" style={{ color: "var(--gold)" }}>
                VOTAÇÃO
              </h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Todos falaram. Discutam no Discord e votem no impostor!
              </p>
              {!amImpostor && card && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--bg)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>A carta era</p>
                  <p className="font-semibold" style={{ color: rarityColor }}>{card.name}</p>
                </div>
              )}
              {me.id === game.hostId && (
                <button
                  onClick={resetGame}
                  disabled={loading}
                  className="w-full mt-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all disabled:opacity-40"
                  style={{ background: "var(--gold)", color: "#0a0b0f" }}
                >
                  Nova Partida
                </button>
              )}
            </div>
          ) : (
            <>
              {isMyTurn && (
                <div className="pulse-ring rounded-2xl p-4 border text-center" style={{ background: "rgba(58,134,255,0.08)", borderColor: "var(--blue)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--blue)" }}>
                    🎙️ É a sua vez de falar!
                  </p>
                </div>
              )}

              {!isMyTurn && (
                <div className="rounded-2xl p-4 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>Vez de</p>
                  <p className="font-semibold text-lg">{currentPlayerName}</p>
                </div>
              )}

              {amImpostor ? (
                <div className="impostor-glow rounded-2xl p-8 text-center border" style={{ background: "var(--surface)", borderColor: "var(--red)" }}>
                  <div className="text-5xl mb-4">🎭</div>
                  <h2 className="font-display text-4xl tracking-wider mb-2" style={{ color: "var(--red)" }}>
                    IMPOSTOR
                  </h2>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Você não sabe a carta. Finja que sabe!
                  </p>
                  <div className="mt-4 h-px" style={{ background: "var(--border)" }} />
                  <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
                    Ouça os outros e engane os jogadores.
                  </p>
                </div>
              ) : (
                card && (
                  <div className="card-glow rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <div className="p-6 text-center">
                      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>A carta é</p>
                      <h2 className="font-display text-5xl tracking-wider mb-2" style={{ color: rarityColor }}>
                        {card.name}
                      </h2>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <span
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ background: `${rarityColor}18`, color: rarityColor }}
                        >
                          {card.rarity}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--bg)", color: "var(--muted)" }}>
                          {card.type}
                        </span>
                      </div>
                    </div>
                    <div className="h-px" style={{ background: "var(--border)" }} />
                    <div className="p-4">
                      <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
                        Descreva a carta <span className="font-semibold" style={{ color: "var(--text)" }}>sem revelar o nome</span>
                      </p>
                    </div>
                  </div>
                )
              )}

              <div className="rounded-2xl p-4 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Ordem de fala</p>
                <div className="space-y-2">
                  {game.turnOrder.map((pid, idx) => {
                    const player = game.players.find(p => p.id === pid);
                    const isCurrent = idx === game.currentTurn;
                    const isDone = idx < game.currentTurn;
                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all"
                        style={{
                          background: isCurrent ? "rgba(58,134,255,0.1)" : "var(--bg)",
                          borderLeft: isCurrent ? "2px solid var(--blue)" : "2px solid transparent",
                        }}
                      >
                        <span className="text-xs w-5 text-center" style={{ color: isDone ? "var(--green)" : isCurrent ? "var(--blue)" : "var(--muted)" }}>
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <span className="flex-1 text-sm" style={{ color: isCurrent ? "var(--text)" : isDone ? "var(--muted)" : "var(--muted)", textDecoration: isDone ? "line-through" : "none" }}>
                          {player?.name}
                        </span>
                        {pid === me.id && (
                          <span className="text-xs" style={{ color: "var(--gold)" }}>você</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isMyTurn && (
                <button
                  onClick={nextTurn}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all disabled:opacity-40 text-sm"
                  style={{ background: "var(--blue)", color: "#fff" }}
                >
                  {loading ? "..." : "Próximo jogador →"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
