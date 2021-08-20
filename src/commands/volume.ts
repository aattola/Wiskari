import { CommandInteraction } from 'discord.js';
import { player } from '../music/player';
import { NotPlayingError } from '../music/errors';
import { SlashCommand } from '../types/command';

const Volume: SlashCommand = {
  data: {
    name: 'volume',
    description: 'Voluumia',
    options: [
      { name: 'volume', description: '5-200', type: 'NUMBER', required: true },
    ],
  },
  async execute(interaction: CommandInteraction) {
    // await interaction.deferReply({ ephemeral: true});

    const queue = player.getQueue(interaction.guild);
    if (!queue) return NotPlayingError(interaction);

    const value = interaction.options.getNumber('volume');
    if (!value) return console.log('Ei volume valuea');
    const success = queue.setVolume(value);

    if (success) {
      await interaction.reply(`Voluumi vaihdettu tuohon: ${value / 2}`);
    }
  },
};

export default Volume;
