# Book Review Tracker Discord Bot

A first pass at the dedicated Discord bot that pairs with the Book Review Tracker project. The bot introduces a `/pushbook` slash command that shares a book announcement in a designated server channel, attaches the provided cover art, and automatically opens a thread where readers can leave reviews.

> ⚠️ This bot currently runs standalone. Integration with the Book Review Tracker web app (automated triggers, shared storage, etc.) will follow in later iterations.

## Features

- `/pushbook` slash command posts a rich embed with title, author, cover image, and optional blurb.
- Automatically creates a thread from the announcement message so the group has a dedicated space for reviews.
- Provides clear feedback when the bot cannot open a thread (e.g., missing permissions or disabled channel threads).

## Getting Started

### 1. Create a Discord Application

1. Head to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Add a bot user under the **Bot** tab and copy the bot token.
3. From the **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes. Grant the bot the `Send Messages`, `Create Public Threads`, and `Send Messages in Threads` permissions. Invite it to your development server using the generated URL.

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and populate it with your Discord credentials:

```bash
cd discord-bot
cp .env.example .env
```

Set the following values:

- `DISCORD_TOKEN` — the bot token from the Developer Portal.
- `DISCORD_CLIENT_ID` — the application client ID.
- `DISCORD_GUILD_ID` *(optional)* — provide a guild/server ID to register commands instantly while testing. Leave blank to register commands globally (may take up to an hour to appear).

### 3. Install Dependencies

```bash
npm install
```

### 4. Register Slash Commands

If you are iterating quickly, set `DISCORD_GUILD_ID` and register the commands for that server:

```bash
npm run register
```

Re-run this script whenever you modify slash command definitions.

### 5. Run the Bot

```bash
npm start
```

Once the bot logs in, head to your server and invoke `/pushbook`. Supply a title, author, and cover URL (Discord must be able to fetch the image), plus an optional blurb to prompt the discussion.

The bot replies with an embed and spins up a thread named after the book. Use that thread to capture everyone’s reviews.

## Next Steps

- Wire the bot to the Book Review Tracker web app so saved books can automatically trigger `/pushbook`-style posts.
- Persist announcements/thread IDs for later updates (e.g., summarizing reactions or editing embeds).
- Expand commands for updating book info, closing threads, or surfacing top reactions.
