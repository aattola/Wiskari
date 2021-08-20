import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../types/command';

const Test: SlashCommand = {
  data: {
    name: 'test',
    description: 'DEV',
  },
  async execute(interaction: CommandInteraction) {
    await interaction.reply('testi vammainen !');
  },
};

export default Test;
