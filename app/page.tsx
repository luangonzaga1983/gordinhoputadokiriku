"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { GameData } from "@/lib/types";

type Me = { id: string; name: string; roomCode?: string };
type StateResponse = { game: GameData | null; players: { id: string; name: string }[] };

const RARITY: Record<string, { color: string; bg: string; label: string }> = {
  Common:    { color: "#9CA3AF", bg: "rgba(156,163,175,0.12)", label: "Comum" },
  Rare:      { color: "#4D9FFF", bg: "rgba(77,159,255,0.12)", label: "Raro" },
  Epic:      { color: "#9B6DFF", bg: "rgba(155,109,255,0.12)", label: "Épico" },
  Legendary: { color: "#FFB800", bg: "rgba(255,184,0,0.12)", label: "Lendário" },
  Champion:  { color: "#FF3D5A", bg: "rgba(255,61,90,0.12)", label: "Campeão" },
};

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    sword: "⚔️", crown: "👑", skull: "💀", eye: "👁️", shield: "🛡️",
    copy: "📋", check: "✅", fire: "🔥", star: "⭐", user: "👤",
    next: "→", vote: "🗳️", new: "🔄", leave: "🚪", enter: "🎮",
    impostor: "🎭", card: "🃏", mic: "🎙️", wait: "⏳", lock: "🔒",
  };
  return <span>{icons[name] ?? "•"}</span>;
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 16, height: 16,
      border: "2px solid rgba(255,255,255,0.2)",
      borderTopColor: "white",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      color, background: bg,
    }}>
      {children}
    </span>
  );
}

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({
  children, onClick, disabled, variant = "primary", size = "md", fullWidth = false, style
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  style?: React.CSSProperties;
}) {
  const variants = {
    primary: { background: "linear-gradient(135deg, #4D9FFF, #1a6fff)", color: "#fff", border: "none" },
    ghost:   { background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border2)" },
    danger:  { background: "linear-gradient(135deg, #FF3D5A, #cc1a35)", color: "#fff", border: "none" },
    success: { background: "linear-gradient(135deg, #00E5A0, #00b87a)", color: "#060810", border: "none" },
    outline: { background: "transparent", color: "var(--text2)", border: "1px solid var(--border2)" },
  };
  const sizes = {
    sm: { padding: "8px 16px", fontSize: 13, borderRadius: 12 },
    md: { padding: "12px 20px", fontSize: 14, borderRadius: 14 },
    lg: { padding: "16px 24px", fontSize: 15, borderRadius: 16 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 8, fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
        transition: "all 0.15s", width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.45 : 1,
        ...variants[variant], ...sizes[size], ...style,
      }}
    >
      {children}
    </button>
  );
}

function RoomCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}?code=${code}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "var(--bg2)",
      border: "1px solid var(--border2)",
      borderRadius: 16,
      padding: "16px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div>
        <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          Código da sala
        </p>
        <p style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700,
          letterSpacing: "0.25em", color: "var(--gold)",
          textShadow: "0 0 20px rgba(255,184,0,0.4)",
        }}>
          {code}
        </p>
      </div>
      <button
        onClick={copy}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          background: copied ? "rgba(0,229,160,0.1)" : "var(--surface2)",
          border: `1px solid ${copied ? "rgba(0,229,160,0.3)" : "var(--border2)"}`,
          borderRadius: 12, padding: "10px 14px", cursor: "pointer",
          color: copied ? "var(--green)" : "var(--text2)",
          transition: "all 0.2s", fontSize: 18, minWidth: 60,
        }}
      >
        {copied ? "✅" : "📋"}
        <span style={{ fontSize: 10, fontWeight: 700 }}>{copied ? "Copiado" : "Copiar"}</span>
      </button>
    </div>
  );
}

function PlayerList({ players, myId, hostId }: { players: { id: string; name: string }[]; myId: string; hostId?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {players.map((p, i) => (
        <div
          key={p.id}
          className={i < 3 ? "anim-fade-up" : ""}
          style={{
            animationDelay: `${i * 0.06}s`,
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px",
            background: p.id === myId ? "rgba(77,159,255,0.08)" : "var(--bg2)",
            border: `1px solid ${p.id === myId ? "rgba(77,159,255,0.25)" : "var(--border)"}`,
            borderRadius: 14,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `hsl(${(p.name.charCodeAt(0) * 47) % 360}, 60%, 35%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0,
            fontFamily: "'Rajdhani', sans-serif",
          }}>
            {p.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: p.id === myId ? "var(--text)" : "var(--text2)" }}>
            {p.name}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {p.id === hostId && <Badge color="#FFB800" bg="rgba(255,184,0,0.12)">👑 Host</Badge>}
            {p.id === myId && <Badge color="#4D9FFF" bg="rgba(77,159,255,0.12)">Você</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Login Screen ───────────────────────────────────────────────────────────
function LoginScreen({ onJoin }: { onJoin: (name: string, code?: string) => Promise<string | null> }) {
  const [name, setName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) { setCodeInput(code.toUpperCase()); setMode("join"); }
  }, []);

  const handle = async () => {
    if (!name.trim()) { setError("Digite seu nome"); return; }
    if (mode === "join" && !codeInput.trim()) { setError("Digite o código da sala"); return; }
    setLoading(true); setError("");
    const err = await onJoin(name.trim(), mode === "join" ? codeInput.trim().toUpperCase() : undefined);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="anim-float" style={{ fontSize: 56, marginBottom: 12 }}>🃏</div>
          <h1 className="font-title" style={{
            fontSize: "clamp(52px, 12vw, 72px)", fontWeight: 700,
            letterSpacing: "0.06em", lineHeight: 1,
            background: "linear-gradient(135deg, #FFB800 0%, #FF8C00 50%, #FF3D5A 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 30px rgba(255,184,0,0.3))",
          }}>
            IMPOSTOR
          </h1>
          <p style={{ color: "var(--text3)", fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6 }}>
            Clash Royale Edition
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="anim-fade-up delay-1" style={{
          display: "flex", background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 4, marginBottom: 20,
        }}>
          {(["create", "join"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1, padding: "11px 8px", borderRadius: 12, border: "none",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer",
                transition: "all 0.2s",
                background: mode === m ? "linear-gradient(135deg, #4D9FFF, #1a6fff)" : "transparent",
                color: mode === m ? "white" : "var(--text3)",
              }}
            >
              {m === "create" ? "🎮 Criar sala" : "🔗 Entrar com código"}
            </button>
          ))}
        </div>

        <Card className="anim-fade-up delay-2" style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Seu nome
            </label>
            <input
              type="text" maxLength={20} placeholder="Como te chamam?"
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
              style={{
                width: "100%", padding: "14px 16px",
                background: "var(--bg2)", border: "1px solid var(--border2)",
                borderRadius: 14, color: "var(--text)", fontSize: 15,
                fontFamily: "inherit", fontWeight: 600, transition: "border-color 0.2s",
              }}
            />
          </div>

          {mode === "join" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Código da sala
              </label>
              <input
                type="text" maxLength={6} placeholder="Ex: AB12C"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handle()}
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "var(--bg2)", border: "1px solid var(--border2)",
                  borderRadius: 14, color: "var(--gold)", fontSize: 20,
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(255,61,90,0.1)", border: "1px solid rgba(255,61,90,0.25)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              color: "var(--red)", fontSize: 13, fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <Btn onClick={handle} disabled={loading} variant="primary" size="lg" fullWidth>
            {loading ? <Spinner /> : mode === "create" ? "Criar sala ⚔️" : "Entrar na sala →"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ─── Lobby Screen ────────────────────────────────────────────────────────────
function LobbyScreen({
  me, players, game, onStart, onLeave, loading, error
}: {
  me: Me;
  players: { id: string; name: string }[];
  game: GameData | null;
  onStart: () => void;
  onLeave: () => void;
  loading: boolean;
  error: string;
}) {
  const isHost = !game || game.hostId === me.id;
  const roomCode = game?.roomCode || me.roomCode;
  const count = players.length;
  const need = Math.max(0, 3 - count);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ textAlign: "center", paddingTop: 16 }}>
          <h1 className="font-title" style={{
            fontSize: 42, fontWeight: 700, letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #FFB800, #FF8C00)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            IMPOSTOR
          </h1>
        </div>

        {/* Room Code */}
        {roomCode && (
          <div className="anim-fade-up delay-1">
            <RoomCodeDisplay code={roomCode} />
          </div>
        )}

        {/* Players */}
        <Card className="anim-fade-up delay-2" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Jogadores
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                background: count >= 3 ? "rgba(0,229,160,0.15)" : "rgba(77,159,255,0.15)",
                color: count >= 3 ? "var(--green)" : "var(--blue)",
                padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              }}>
                {count}/∞
              </span>
            </div>
          </div>

          {players.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text3)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
              <p style={{ fontSize: 13 }}>Nenhum jogador ainda</p>
            </div>
          ) : (
            <PlayerList players={players} myId={me.id} hostId={game?.hostId || me.id} />
          )}
        </Card>

        {/* Status / Actions */}
        <div className="anim-fade-up delay-3">
          {need > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(77,159,255,0.08)", border: "1px solid rgba(77,159,255,0.2)",
              borderRadius: 14, padding: "14px 18px", marginBottom: 12,
            }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <p style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600 }}>
                Aguardando mais {need} jogador{need !== 1 ? "es" : ""} para iniciar
              </p>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(255,61,90,0.1)", border: "1px solid rgba(255,61,90,0.25)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 12,
              color: "var(--red)", fontSize: 13, fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isHost && count >= 3 && (
              <Btn onClick={onStart} disabled={loading} variant="success" size="lg" fullWidth>
                {loading ? <Spinner /> : <><span>⚔️</span> Iniciar Partida</>}
              </Btn>
            )}
            <Btn onClick={onLeave} variant="outline" size="md" fullWidth>
              🚪 Sair do lobby
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Game Screen ─────────────────────────────────────────────────────────────
function GameScreen({
  me, game, onNextTurn, onReset, loading
}: {
  me: Me;
  game: GameData;
  onNextTurn: () => void;
  onReset: () => void;
  loading: boolean;
}) {
  const amImpostor = game.impostorId === me.id;
  const myTurnId = game.turnOrder[game.currentTurn];
  const isMyTurn = myTurnId === me.id;
  const card = game.card;
  const rarity = card ? RARITY[card.rarity] : null;
  const currentPlayerName = game.players.find(p => p.id === myTurnId)?.name;
  const isHost = game.hostId === me.id;
  const amIPlaying = game.players.some(p => p.id === me.id);

  if (!amIPlaying) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👁️</div>
          <p style={{ color: "var(--text2)" }}>Você está assistindo a partida.</p>
        </div>
      </div>
    );
  }

  if (game.state === "voting") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="anim-slide-up" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🗳️</div>
            <h2 className="font-title" style={{
              fontSize: 52, fontWeight: 700, letterSpacing: "0.06em",
              color: "var(--gold)", textShadow: "0 0 30px rgba(255,184,0,0.4)",
            }}>
              VOTAÇÃO
            </h2>
            <p style={{ color: "var(--text2)", marginTop: 8, fontSize: 15, fontWeight: 600 }}>
              Todos falaram! Discutam no Discord e votem.
            </p>
          </div>

          {!amImpostor && card && rarity && (
            <Card className="anim-fade-up delay-2 shimmer-wrap" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                A carta era
              </p>
              <p className="font-title" style={{ fontSize: 40, fontWeight: 700, color: rarity.color, letterSpacing: "0.05em" }}>
                {card.name}
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
                <Badge color={rarity.color} bg={rarity.bg}>{rarity.label}</Badge>
                <Badge color="var(--text3)" bg="var(--surface2)">{card.type}</Badge>
              </div>
            </Card>
          )}

          {amImpostor && (
            <Card className="anim-fade-up delay-2 glow-red" style={{ padding: 24, textAlign: "center", borderColor: "rgba(255,61,90,0.3)" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎭</div>
              <p style={{ color: "var(--red)", fontWeight: 700, fontSize: 16 }}>
                Você era o Impostor!
              </p>
              <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 6 }}>
                Boa sorte na votação...
              </p>
            </Card>
          )}

          {isHost && (
            <Btn onClick={onReset} disabled={loading} variant="success" size="lg" fullWidth>
              {loading ? <Spinner /> : <><span>🔄</span> Nova Partida</>}
            </Btn>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "20px 16px 32px" }}>
      <div style={{ width: "100%", maxWidth: 460, margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Turn indicator */}
        {isMyTurn ? (
          <div className="anim-slide-up glow-blue" style={{
            background: "rgba(77,159,255,0.1)", border: "1px solid rgba(77,159,255,0.35)",
            borderRadius: 18, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(77,159,255,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22, flexShrink: 0,
            }}>
              🎙️
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: "var(--blue)" }}>É a sua vez!</p>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                Fale no Discord quando estiver pronto
              </p>
            </div>
          </div>
        ) : (
          <div className="anim-fade-up" style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 18, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 18, animation: "pulse 1.5s ease-in-out infinite" }}>🎙️</div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Falando agora
              </p>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginTop: 2 }}>
                {currentPlayerName}
              </p>
            </div>
          </div>
        )}

        {/* Card or Impostor */}
        {amImpostor ? (
          <div className="anim-card-reveal glow-red shimmer-wrap" style={{
            background: "linear-gradient(135deg, #1a0a0e 0%, #200d12 50%, #1a0a0e 100%)",
            border: "1px solid rgba(255,61,90,0.4)",
            borderRadius: 24, padding: 32, textAlign: "center",
            flex: "1 1 auto",
          }}>
            <div style={{ fontSize: 72, marginBottom: 20, filter: "drop-shadow(0 0 20px rgba(255,61,90,0.5))" }}>
              🎭
            </div>
            <h2 className="font-title" style={{
              fontSize: 52, fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--red)", textShadow: "0 0 40px rgba(255,61,90,0.5)",
              marginBottom: 12,
            }}>
              IMPOSTOR
            </h2>
            <p style={{ color: "#ff8a99", fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
              Você não sabe qual é a carta.
            </p>
            <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>
              Ouça os outros e finja que sabe!
            </p>
            <div style={{
              marginTop: 24, padding: "12px 16px",
              background: "rgba(255,61,90,0.08)", border: "1px solid rgba(255,61,90,0.15)",
              borderRadius: 12,
            }}>
              <p style={{ fontSize: 12, color: "#ff6b80", fontWeight: 600 }}>
                💡 Dica: seja vago, mas convincente
              </p>
            </div>
          </div>
        ) : card && rarity ? (
          <div className="anim-card-reveal shimmer-wrap" style={{
            background: `linear-gradient(135deg, var(--surface) 0%, ${rarity.bg} 100%)`,
            border: `1px solid ${rarity.color}44`,
            borderRadius: 24, padding: 32, textAlign: "center",
            flex: "1 1 auto",
            boxShadow: `0 0 40px ${rarity.color}15, 0 0 80px ${rarity.color}08`,
          }}>
            <div style={{
              fontSize: 11, color: "var(--text3)", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>
              🃏 A carta é
            </div>
            <h2 className="font-title" style={{
              fontSize: "clamp(36px, 8vw, 56px)",
              fontWeight: 700, letterSpacing: "0.04em",
              color: rarity.color,
              textShadow: `0 0 40px ${rarity.color}50`,
              lineHeight: 1.1, marginBottom: 16,
            }}>
              {card.name}
            </h2>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              <Badge color={rarity.color} bg={rarity.bg}>⭐ {rarity.label}</Badge>
              <Badge color="var(--text3)" bg="var(--surface2)">{card.type}</Badge>
            </div>
            <div style={{
              padding: "14px 18px",
              background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
            }}>
              <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600, lineHeight: 1.5 }}>
                Descreva a carta <strong style={{ color: "var(--text)" }}>sem revelar o nome</strong>.<br/>
                Seja convincente!
              </p>
            </div>
          </div>
        ) : null}

        {/* Turn Order */}
        <Card style={{ padding: 18 }}>
          <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Ordem de fala
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {game.turnOrder.map((pid, idx) => {
              const player = game.players.find(p => p.id === pid);
              const isCurrent = idx === game.currentTurn;
              const isDone = idx < game.currentTurn;
              return (
                <div key={pid} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12,
                  background: isCurrent ? "rgba(77,159,255,0.1)" : "transparent",
                  border: `1px solid ${isCurrent ? "rgba(77,159,255,0.3)" : "transparent"}`,
                  transition: "all 0.3s",
                  opacity: isDone ? 0.45 : 1,
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800,
                    background: isDone ? "rgba(0,229,160,0.15)" : isCurrent ? "rgba(77,159,255,0.2)" : "var(--bg2)",
                    color: isDone ? "var(--green)" : isCurrent ? "var(--blue)" : "var(--text3)",
                  }}>
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: 600,
                    color: isCurrent ? "var(--text)" : "var(--text2)",
                    textDecoration: isDone ? "line-through" : "none",
                  }}>
                    {player?.name}
                  </span>
                  {pid === me.id && <span style={{ fontSize: 11, color: "var(--gold)" }}>você</span>}
                  {isCurrent && <span style={{ fontSize: 16, animation: "pulse 1s ease-in-out infinite" }}>🎙️</span>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Next turn button */}
        {isMyTurn && (
          <Btn onClick={onNextTurn} disabled={loading} variant="primary" size="lg" fullWidth>
            {loading ? <Spinner /> : <>Próximo jogador →</>}
          </Btn>
        )}
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [me, setMe] = useState<Me | null>(null);
  const [data, setData] = useState<StateResponse>({ game: null, players: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("impostor_me");
    if (saved) setMe(JSON.parse(saved));
    fetchState();
    pollRef.current = setInterval(fetchState, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchState]);

  const handleJoin = async (name: string, code?: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) return json.error;
      const player = { ...json, roomCode: code };
      setMe(player);
      localStorage.setItem("impostor_me", JSON.stringify(player));
      await fetchState();
      return null;
    } catch { return "Erro de conexão"; }
  };

  const handleLeave = async () => {
    if (!me) return;
    await fetch("/api/leave", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: me.id }),
    });
    localStorage.removeItem("impostor_me");
    setMe(null);
    await fetchState();
  };

  const handleStart = async () => {
    if (!me) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: me.id, roomCode: me.roomCode }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      if (json.roomCode) {
        const updated = { ...me, roomCode: json.roomCode };
        setMe(updated);
        localStorage.setItem("impostor_me", JSON.stringify(updated));
      }
      await fetchState();
    } finally { setLoading(false); }
  };

  const handleNextTurn = async () => {
    if (!me) return;
    setLoading(true);
    try {
      await fetch("/api/next-turn", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: me.id }),
      });
      await fetchState();
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (!me) return;
    setLoading(true);
    try {
      await fetch("/api/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: me.id }),
      });
      await fetchState();
    } finally { setLoading(false); }
  };

  const { game, players } = data;

  if (!me) return <LoginScreen onJoin={handleJoin} />;

  if (!game || game.state === "ended") {
    return (
      <LobbyScreen
        me={me} players={players} game={game}
        onStart={handleStart} onLeave={handleLeave}
        loading={loading} error={error}
      />
    );
  }

  return (
    <GameScreen
      me={me} game={game}
      onNextTurn={handleNextTurn} onReset={handleReset}
      loading={loading}
    />
  );
}
