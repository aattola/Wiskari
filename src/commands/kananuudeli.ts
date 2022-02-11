import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../types/command';
import { rivi1, rivi2 } from '../stuff/kanaComponents';

const Kananuudeli: SlashCommand = {
  data: {
    name: 'nuudeliriisi',
    description: 'Nuudelikana',
  },
  async execute(interaction: CommandInteraction) {
    await interaction.reply({
      content:
        'Äänestä ja vaikuta. Kerro mielipiteesi tässä tärkeässä yhteiskuntaan vaikuttavassa asiassa.',
      components: [rivi1, rivi2],
    });
  },
};

export default Kananuudeli;
