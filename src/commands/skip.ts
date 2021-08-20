import { CommandInteraction } from 'discord.js';
import { player } from '../music/player';
import { NotPlayingError } from '../music/errors';
import { SlashCommand } from '../types/command';

const Skip: SlashCommand = {
  data: {
    name: 'skip',
    description: 'Ohittaa musiikkia',
  },
  async execute(interaction: CommandInteraction) {
    // await interaction.deferReply({ ephemeral: true});

    const queue = player.getQueue(interaction.guild);
    if (!queue) return NotPlayingError(interaction);

    const success = queue.skip();

    if (success) {
      await interaction.reply(`Musiikki ohitettu menestyksellä`);
    }
  },
};

export default Skip;
