import { ApplicationCommandData, Client, CommandInteraction } from 'discord.js';

interface SlashCommand {
  data: ApplicationCommandData;
  execute(interaction: CommandInteraction, client: Client): Promise<void>;
}

export { SlashCommand };
