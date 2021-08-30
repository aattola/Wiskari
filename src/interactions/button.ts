import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction } from 'discord.js';
import { TictacManager } from '../tictac';

const Button = {
  data: new SlashCommandBuilder().setName('button').setDescription('huutinen'),
  async execute(interaction: ButtonInteraction) {
    if (interaction.customId.startsWith('ttt')) {
      const tictac = TictacManager.getInstance();
      await tictac.handleButtonInteraction(interaction);
      return;
    }
    await interaction.reply('testi vammainen !');
  },
};

export default Button;
