import { SlashCommandBuilder } from '@discordjs/builders';
import { ContextMenuInteraction } from 'discord.js';

const Button = {
  data: new SlashCommandBuilder()
    .setName('contextmenu')
    .setDescription('huutinen'),
  async execute(interaction: ContextMenuInteraction) {
    await interaction.reply('contextMenu');
  },
};

export default Button;
