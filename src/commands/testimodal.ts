import {
  CommandInteraction,
  MessageActionRow,
  Modal,
  ModalActionRowComponent,
  TextInputComponent,
} from 'discord.js';
import { SlashCommand } from '../types/command';

const TestModal: SlashCommand = {
  data: {
    name: 'testimodal',
    description: 'testi uusi hieno interaction',
  },
  async execute(interaction: CommandInteraction) {
    const favoriteColorInput = new TextInputComponent()
      .setCustomId('kissa')
      // The label is the prompt the user sees for this input
      .setLabel('Oletko tää kissa')
      // Short means only a single line of text
      .setStyle('SHORT');

    const favoriteColorInput2 = new TextInputComponent()
      .setCustomId('orava')
      // The label is the prompt the user sees for this input
      .setLabel('Oletko kissa')
      // Short means only a single line of text
      .setStyle('PARAGRAPH');

    const firstRow = new MessageActionRow<
      ModalActionRowComponent
    >().addComponents([favoriteColorInput]);
    const secondActionRow = new MessageActionRow<
      ModalActionRowComponent
    >().addComponents(favoriteColorInput2);

    const modal = new Modal()
      .setCustomId('testmodal')
      .setTitle('Oletko toi kissa kysely')
      .addComponents(firstRow, secondActionRow);
    await interaction.showModal(modal);
    // await interaction.reply('testi vammainen !');
  },
};

export default TestModal;
