import { CommandInteraction } from 'discord.js';
import BlockGif from '../managers/blockGif';
import { SlashCommand } from '../types/command';

const Poistablock: SlashCommand = {
  data: {
    name: 'poistablock',
    description: 'Poistaa tavaraa blokkilistalta (url linkki tai hash)',
    options: [
      {
        name: 'hash',
        type: 'STRING',
        description: 'Osoite tai hash',
        required: true,
      },
    ],
  },
  async execute(interaction: CommandInteraction): Promise<void> {
    await BlockGif.removeBlock(interaction);
  },
};

export default Poistablock;
