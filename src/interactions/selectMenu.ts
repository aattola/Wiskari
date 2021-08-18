import { SlashCommandBuilder } from '@discordjs/builders';
import { SelectMenuInteraction } from 'discord.js';

const Button = {
  data: new SlashCommandBuilder()
    .setName('selectmenu')
    .setDescription('huutinen'),
  async execute(interaction: SelectMenuInteraction) {
    await interaction.reply('selectmenu testi');
  },
};

export default Button;
