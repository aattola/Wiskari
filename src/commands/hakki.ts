import { CommandInteraction } from 'discord.js';
import { player } from '../music/player';
import { NotPlayingError } from '../music/errors';
import { SlashCommand } from '../types/command';

const Hakki: SlashCommand = {
  data: {
    name: 'hakki',
    description: 'Häkitä ',
  },
  async execute(interaction: CommandInteraction) {
    // await interaction.deferReply({ ephemeral: true});

    await interaction.reply('häkkiin klopit (tammiset)');
  },
};

export default Hakki;
