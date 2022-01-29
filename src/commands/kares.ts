import { CommandInteraction } from 'discord.js';
import { player } from '../music/player';
import { NotPlayingError } from '../music/errors';
import { SlashCommand } from '../types/command';

const Kares: SlashCommand = {
  data: {
    name: 'kares',
    description: 'Pistä kares istumaan',
    options: [
      {
        name: 'nimi',
        description: 'Karekselle uusi laadukas nimi',
        type: 'STRING',
        required: true,
      },
    ],
  },
  async execute(interaction: CommandInteraction) {
    // jerry id "270236553865854982"
    // await interaction.deferReply({ ephemeral: true});

    const name = interaction.options.getString('nimi');
    if (!name) {
      throw new Error('Joku kusi nimen saannissa');
    }

    try {
      const kares = await interaction.guild.members.fetch('270236553865854982');
      await kares.setNickname(name, 'Sinua on trollattu');
      await interaction.reply({
        content: 'Nimi vaihdettu onnistuneesti',
        ephemeral: true,
      });
    } catch (e) {
      throw new Error(e);
    }
  },
};

export default Kares;
