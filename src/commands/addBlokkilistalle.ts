import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../types/command';

const AddBlokkilistalle: SlashCommand = {
  data: {
    name: 'Lisää blokkilistalle',
    type: 'MESSAGE',
    defaultPermission: true,
  },
  async execute(interaction: CommandInteraction) {
    const ok = null;
    // console.log(interaction);
  },
};

export default AddBlokkilistalle;
