import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { SlashCommand } from '../types/command';

const PunainenNappi: SlashCommand = {
  data: {
    name: 'punainennappi',
    description: 'Paina tätä ja katso mitä tapahtuu',
  },
  async execute(interaction: CommandInteraction) {
    // await interaction.deferReply({ ephemeral: true});
    const nappi = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('punainennappi')
        .setLabel('RÄJÄYTÄ MAAPALLO')
        .setStyle('DANGER')
    );

    await interaction.reply({
      content: 'Tämä nappi on tehty vain Jerry Karesta varten',
      components: [nappi],
    });
  },
};

export default PunainenNappi;
