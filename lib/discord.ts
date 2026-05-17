const TOKEN = process.env.DISCORD_TOKEN!;
const BASE = "https://discord.com/api/v10";
const PLAYERS_CHANNEL = "1505711357062938736";
const GAME_CHANNEL = "1505711488164298972";

const headers = {
  Authorization: `Bot ${TOKEN}`,
  "Content-Type": "application/json",
};

async function fetchMessages(channelId: string, limit = 10) {
  const res = await fetch(`${BASE}/channels/${channelId}/messages?limit=${limit}`, { headers, cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function sendMessage(channelId: string, content: string) {
  const res = await fetch(`${BASE}/channels/${channelId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  return res.json();
}

async function editMessage(channelId: string, messageId: string, content: string) {
  const res = await fetch(`${BASE}/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ content }),
  });
  return res.json();
}

async function deleteMessage(channelId: string, messageId: string) {
  await fetch(`${BASE}/channels/${channelId}/messages/${messageId}`, {
    method: "DELETE",
    headers,
  });
}

const STATE_TAG = "GAMESTATE:";
const PLAYERS_TAG = "PLAYERS:";

export async function getGameState() {
  const messages = await fetchMessages(GAME_CHANNEL, 20);
  const stateMsg = messages.find((m: { content: string }) => m.content.startsWith(STATE_TAG));
  if (!stateMsg) return null;
  try {
    return { data: JSON.parse(stateMsg.content.slice(STATE_TAG.length)), messageId: stateMsg.id };
  } catch {
    return null;
  }
}

export async function setGameState(data: unknown, messageId?: string) {
  const content = STATE_TAG + JSON.stringify(data);
  if (messageId) {
    return editMessage(GAME_CHANNEL, messageId, content);
  }
  return sendMessage(GAME_CHANNEL, content);
}

export async function getPlayers(): Promise<{ id: string; name: string }[]> {
  const messages = await fetchMessages(PLAYERS_CHANNEL, 20);
  const playersMsg = messages.find((m: { content: string }) => m.content.startsWith(PLAYERS_TAG));
  if (!playersMsg) return [];
  try {
    return JSON.parse(playersMsg.content.slice(PLAYERS_TAG.length));
  } catch {
    return [];
  }
}

export async function setPlayers(players: { id: string; name: string }[]) {
  const messages = await fetchMessages(PLAYERS_CHANNEL, 20);
  const existing = messages.find((m: { content: string }) => m.content.startsWith(PLAYERS_TAG));
  const content = PLAYERS_TAG + JSON.stringify(players);
  if (existing) {
    await editMessage(PLAYERS_CHANNEL, existing.id, content);
  } else {
    await sendMessage(PLAYERS_CHANNEL, content);
  }
}

export async function clearGameChannel() {
  const messages = await fetchMessages(GAME_CHANNEL, 20);
  for (const m of messages) {
    await deleteMessage(GAME_CHANNEL, m.id);
    await new Promise(r => setTimeout(r, 300));
  }
}
