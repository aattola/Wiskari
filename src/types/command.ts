import {
  ApplicationCommandData,
  ApplicationCommandPermissionData,
  Client,
  CommandInteraction,
} from 'discord.js';

interface SlashCommand {
  data: ApplicationCommandData;
  permissions?: ApplicationCommandPermissionData[];
  execute(interaction: CommandInteraction, client: Client): Promise<void>;
}

export { SlashCommand };
