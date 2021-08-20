import { CommandInteraction } from 'discord.js';
import { player } from '../music/player';
import { NotPlayingError } from '../music/errors';
import { SlashCommand } from '../types/command';

const Leave: SlashCommand = {
  data: {
    name: 'leave',
    description: 'Lähtee kanavasta',
  },
  async execute(interaction: CommandInteraction) {
    // await interaction.deferReply({ ephemeral: true});

    const queue = player.getQueue(interaction.guild);
    if (!queue) return NotPlayingError(interaction);

    queue.stop();
  },
};

export default Leave;
