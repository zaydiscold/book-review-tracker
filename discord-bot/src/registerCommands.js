import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
  throw new Error('DISCORD_TOKEN is required to register commands.');
}

if (!clientId) {
  throw new Error('DISCORD_CLIENT_ID is required to register commands.');
}

const rest = new REST({ version: '10' }).setToken(token);

async function register() {
  try {
    console.log('Refreshing application (/) commands…');
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands.map((command) => command.toJSON()),
      });
      console.log('Successfully reloaded guild commands.');
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands.map((command) => command.toJSON()),
      });
      console.log('Successfully reloaded global commands.');
    }
  } catch (error) {
    console.error('Error reloading commands:', error);
    process.exitCode = 1;
  }
}

register();
