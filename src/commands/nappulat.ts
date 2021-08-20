import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} from 'discord.js';
import { SlashCommand } from '../types/command';

const Test: SlashCommand = {
  data: {
    name: 'testnappulat',
    description: 'DEV',
  },
  async execute(interaction: CommandInteraction): Promise<void> {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('primary')
        .setLabel('Primary')
        .setStyle('PRIMARY')
    );

    const row2 = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('hö')
        .setPlaceholder('valitse jotain')
        .addOptions([
          {
            label: 'Ok',
            description: 'Cookie',
            value: 'kissa',
          },
        ])
    );

    await interaction.reply({
      content: 'nappulat',
      components: [row, row2],
    });
  },
};

export default Test;
