# Impostor — Clash Royale Edition

Jogo multiplayer de impostor integrado ao Discord, usando cartas do Clash Royale.

## Configuração

### 1. Criar o Bot do Discord

1. Acesse https://discord.com/developers/applications
2. Crie um novo aplicativo e vá em **Bot**
3. Ative as permissões: **Read Messages/View Channels**, **Send Messages**, **Manage Messages**
4. Copie o token do bot
5. Convide o bot para o servidor com permissões de leitura/escrita nos canais:
   - `1505711357062938736` (jogadores)
   - `1505711488164298972` (estado da partida)

### 2. Variáveis de Ambiente

Crie um arquivo `.env.local`:
```
DISCORD_TOKEN=seu_token_aqui
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

### 4. Deploy na Vercel

1. Conecte o repositório na Vercel
2. Adicione a variável de ambiente `DISCORD_TOKEN` nas configurações do projeto
3. Deploy automático

## Como jogar

1. Todos os jogadores entram no site e escolhem um nome
2. Com 3+ jogadores no lobby, o host clica em **Iniciar Partida**
3. O sistema sorteia uma carta do Clash Royale e escolhe 1 impostor aleatório
4. **Jogadores normais** veem o nome da carta — devem descrevê-la sem revelar o nome
5. **O impostor** não vê a carta — deve fingir que sabe qual é
6. Cada jogador fala na sua vez (aviso visual na tela); quando terminar, clica em **Próximo jogador**
7. Após todos falarem, a fase de **votação** começa — discutam no Discord e votem em quem é o impostor
8. O host pode iniciar uma nova partida

## Estrutura

```
app/
  page.tsx          # UI principal (login + lobby + jogo)
  layout.tsx
  globals.css
  api/
    join/           # Entrar no lobby
    leave/          # Sair do lobby
    start/          # Iniciar partida
    next-turn/      # Passar a vez
    state/          # Polling do estado
    reset/          # Resetar partida
lib/
  cards.ts          # Todas as cartas do Clash Royale
  discord.ts        # Integração com Discord API
  types.ts          # Tipos TypeScript
```
