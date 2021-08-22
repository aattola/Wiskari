import { ApplicationCommandData, Client } from 'discord.js';
import fs from 'fs';
import { SlashCommand } from './types/command';

const commandFiles = fs
  .readdirSync(`${__dirname}\\commands`)
  .filter((file) => file.endsWith('.ts'));

const devGuilds = ['279272653834027008'];

const loadCommands = async (client: Client) => {
  const commands = await client.application.commands.fetch();

  const botCommands: ApplicationCommandData[] = [];
  for (const file of commandFiles) {
    const de = await import(`./commands/${file}`);
    const command: SlashCommand = de.default;
    botCommands.push(command.data);
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('[PROD commandLoader] Komennot asennettu applikaatioon');
    client.application.commands.set(botCommands);
  }

  if (process.env.NODE_ENV === 'development') {
    devGuilds.forEach((id) => {
      client.guilds.cache
        .get(id)
        .commands.set(botCommands)
        .then(() => {
          console.log(`[DEV commandLoader] Komennot asennettu guildiin ${id}`);
        });
    });
  }
};

export { loadCommands };
