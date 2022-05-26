import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../types/command';

const Ylimaarainen: SlashCommand = {
  data: {
    name: 'ylimaarainen',
    description: 'Onko kloppi ylimääräinen. Heitä hänet roskiin!',
    options: [
      {
        type: 'USER',
        name: 'ukko',
        description: 'Ketä rankaistaan',
        required: true,
      },
    ],
  },
  async execute(interaction: CommandInteraction) {
    const ukko = interaction.options.getUser('ukko');
    if (!ukko) throw new Error('Ethän pingannu ketää?? (ukko null)');

    await interaction.reply('testi vammainen !');
  },
};

export default Ylimaarainen;
