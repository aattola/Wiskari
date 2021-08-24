import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import getUrls from 'extract-urls';
import { crc32 } from 'crc';
import BlockGif from '../blockGif';
import { SlashCommand } from '../types/command';

const Poistablock: SlashCommand = {
  data: {
    name: 'poistablock',
    description: 'Poistaa tavaraa blokkilistalta (url linkki tai hash)',
    options: [{ name: 'hash', type: 'STRING', description: 'Osoite tai hash' }],
  },
  async execute(interaction: CommandInteraction): Promise<void> {
    await BlockGif.removeBlock(interaction);
  },
};

export default Poistablock;
