import { SlashCommandBuilder } from '@discordjs/builders';
import { ContextMenuInteraction } from 'discord.js';
import BlockGif from '../blockGif';

const Button = {
  data: {
    name: 'Lisää blokkilistalle',
  },
  async execute(interaction: ContextMenuInteraction): Promise<void> {
    // BlockGif.block();
    await BlockGif.block(interaction);
  },
};

export default Button;
