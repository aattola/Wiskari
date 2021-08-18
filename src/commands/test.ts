import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

const Test = {
  data: new SlashCommandBuilder().setName('test').setDescription('huutinen'),
  async execute(interaction: CommandInteraction) {
    await interaction.reply('testi vammainen !');
  },
};

export default Test;
