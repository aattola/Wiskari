import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction } from 'discord.js';

const Button = {
  data: new SlashCommandBuilder().setName('button').setDescription('huutinen'),
  async execute(interaction: ButtonInteraction) {
    await interaction.reply('testi vammainen !');
  },
};

export default Button;
