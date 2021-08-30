import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../types/command';
import { TictacManager } from '../tictac';

const TicTac: SlashCommand = {
  data: {
    name: 'tictac',
    description: 'DEV kommento',
    options: [
      {
        name: 'koko',
        description: 'Siis valitset tästä pelialueen koon',
        type: 'STRING',
        required: true,
        choices: [
          {
            name: '3x3',
            value: '3',
          },
          {
            name: '4x4',
            value: '4',
          },
          {
            name: '5x5',
            value: '5',
          },
        ],
      },
      {
        name: 'vastustaja',
        description: 'Ketä vastaan taistelemme',
        required: false,
        type: 'USER',
      },
    ],
  },
  async execute(interaction: CommandInteraction) {
    // TODO: Komento semmoinen subkomento että aloita ja lopeta peli ja tämmösiä tictac.disableGame lopeta peliin
    const tictac = TictacManager.getInstance();
    tictac.createGame(interaction);
  },
};

export default TicTac;
